import { NextRequest } from "next/server";
import { jsonResponse } from "@/app/lib/auth-helpers";
import {
  createSessionCookieFromIdToken,
  setSessionCookie,
} from "@/app/lib/auth-session";
import { callIdentityToolkit } from "@/app/lib/firebase-auth-rest";

export const runtime = "nodejs";

type SignInResponse = {
  idToken: string;
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return jsonResponse(
        { success: false, error: "Email and password are required" },
        400,
      );
    }

    const result = await callIdentityToolkit<SignInResponse>(
      "accounts:signInWithPassword",
      { email, password, returnSecureToken: true },
    );

    const sessionCookie = await createSessionCookieFromIdToken(result.idToken);
    const response = jsonResponse({ success: true });
    setSessionCookie(response, sessionCookie);
    return response;
  } catch (error) {
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : "auth/unknown";
    return jsonResponse({ success: false, errorCode: code }, 401);
  }
}
