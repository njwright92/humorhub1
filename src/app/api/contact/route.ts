import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields." },
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
        template_params: { name, email, message },
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
