import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, hasTrustedOrigin } from "@/app/lib/request-guards";

export const runtime = "nodejs";

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request: NextRequest) {
  try {
    if (!hasTrustedOrigin(request)) {
      return NextResponse.json(
        { success: false, error: "Invalid request origin." },
        { status: 403 },
      );
    }

    const rateLimit = checkRateLimit(request, {
      key: "contact-form",
      windowMs: 15 * 60 * 1000,
      maxRequests: 3,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many messages sent. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
          },
        },
      );
    }

    const { name, email, message } = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    const trimmedName = name?.trim() ?? "";
    const trimmedEmail = email?.trim() ?? "";
    const trimmedMessage = message?.trim() ?? "";

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
        { status: 400 },
      );
    }

    if (
      trimmedName.length > MAX_NAME_LENGTH ||
      trimmedEmail.length > MAX_EMAIL_LENGTH ||
      trimmedMessage.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json(
        { success: false, error: "One or more fields are too long." },
        { status: 400 },
      );
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_TEMPLATE_ID1 ||
      !process.env.EMAILJS_PUBLIC_KEY ||
      !process.env.EMAILJS_PRIVATE_KEY
    ) {
      return NextResponse.json(
        { success: false, error: "Server misconfiguration." },
        { status: 500 },
      );
    }

    const response = await fetch(EMAILJS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID1,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY,
        template_params: {
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("EmailJS send failed:", response.status, details);
      return NextResponse.json(
        {
          success: false,
          error:
            process.env.NODE_ENV === "development"
              ? details || "Failed to send message."
              : "Failed to send message.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
