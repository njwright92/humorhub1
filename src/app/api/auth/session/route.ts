import { NextRequest } from "next/server";
import { jsonResponse } from "@/app/lib/auth-helpers";
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
} from "@/app/lib/auth-session";
import { getServerAuth } from "@/app/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    const response = jsonResponse({ success: true, signedIn: false });
    response.headers.set(
      "Cache-Control",
      "private, max-age=0, must-revalidate",
    );
    return response;
  }

  try {
    const decoded = await getServerAuth().verifySessionCookie(sessionCookie);
    const response = jsonResponse({
      success: true,
      signedIn: true,
      uid: decoded.uid,
      email: decoded.email,
    });
    response.headers.set(
      "Cache-Control",
      "private, max-age=0, must-revalidate",
    );
    return response;
  } catch {
    const response = jsonResponse({ success: true, signedIn: false });
    clearSessionCookie(response);
    response.headers.set(
      "Cache-Control",
      "private, max-age=0, must-revalidate",
    );
    return response;
  }
}
