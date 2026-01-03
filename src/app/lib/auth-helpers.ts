import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/app/lib/firebase-admin";
import type { ApiResponse } from "@/app/lib/types";

export type AuthResult =
  | { success: true; uid: string }
  | { success: false; response: NextResponse };

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Missing authorization header",
        } as ApiResponse,
        { status: 401 }
      ),
    };
  }

  const { valid, uid } = await verifyIdToken(authHeader.slice(7));

  if (!valid || !uid) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: "Invalid or expired token" } as ApiResponse,
        { status: 401 }
      ),
    };
  }

  return { success: true, uid };
}

export function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}
