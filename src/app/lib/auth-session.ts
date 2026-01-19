import { NextResponse } from "next/server";
import { getServerAuth } from "@/app/lib/firebase-admin";

export const SESSION_COOKIE_NAME = "__session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function createSessionCookieFromIdToken(idToken: string) {
  const auth = getServerAuth();
  return auth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
  });
}

export function setSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
