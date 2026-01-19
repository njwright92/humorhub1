import { NextRequest, NextResponse } from "next/server";
import { callIdentityToolkit } from "@/app/lib/firebase-auth-rest";
import {
  createSessionCookieFromIdToken,
  setSessionCookie,
} from "@/app/lib/auth-session";

export const runtime = "nodejs";

const STATE_COOKIE = "google_oauth_state";

type GoogleTokenResponse = {
  id_token?: string;
};

type FirebaseIdpResponse = {
  idToken: string;
};

function buildPopupHtml(success: boolean, errorCode?: string) {
  const payload = JSON.stringify({
    type: "google-auth",
    success,
    errorCode,
  });

  return `<!doctype html>
<html>
  <body>
    <script>
      if (window.opener) {
        window.opener.postMessage(${payload}, window.location.origin);
      }
      window.close();
    </script>
  </body>
</html>`;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  const storedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code || !state || !storedState || state !== storedState) {
    const response = new NextResponse(
      buildPopupHtml(false, "auth/invalid-credential"),
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
    response.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  if (!clientId || !clientSecret || !redirectUri) {
    const response = new NextResponse(
      buildPopupHtml(false, "auth/operation-not-allowed"),
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
    response.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("google_token_exchange_failed");
    }

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenData.id_token) {
      throw new Error("missing_google_id_token");
    }

    const firebaseData = await callIdentityToolkit<FirebaseIdpResponse>(
      "accounts:signInWithIdp",
      {
        postBody: `id_token=${tokenData.id_token}&providerId=google.com`,
        requestUri: redirectUri,
        returnSecureToken: true,
      },
    );

    const sessionCookie = await createSessionCookieFromIdToken(
      firebaseData.idToken,
    );
    const response = new NextResponse(buildPopupHtml(true), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    setSessionCookie(response, sessionCookie);
    response.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  } catch {
    const response = new NextResponse(buildPopupHtml(false, "auth/unknown"), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    response.cookies.set(STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }
}
