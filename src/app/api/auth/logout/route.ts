import { clearSessionCookie } from "@/app/lib/auth-session";
import { jsonResponse } from "@/app/lib/auth-helpers";

export const runtime = "nodejs";

export async function POST() {
  const response = jsonResponse({ success: true });
  clearSessionCookie(response);
  return response;
}
