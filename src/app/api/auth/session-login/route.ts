import { NextRequest } from "next/server";
import { jsonResponse } from "@/app/lib/auth-helpers";
import {
  createSessionCookieFromIdToken,
  setSessionCookie,
} from "@/app/lib/auth-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return jsonResponse({ success: false, error: "Missing idToken" }, 400);
    }

    const sessionCookie = await createSessionCookieFromIdToken(idToken);
    const response = jsonResponse({ success: true });
    setSessionCookie(response, sessionCookie);
    return response;
  } catch {
    return jsonResponse({ success: false, error: "Invalid token" }, 401);
  }
}
