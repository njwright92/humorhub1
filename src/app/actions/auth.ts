"use server";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export async function validateAndAuth(
  email: string,
  password: string,
  confirmPassword: string,
  isSignIn: boolean,
): Promise<{ success: boolean; error?: string }> {
  // Validation on server-side
  if (!emailRegex.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  if (!isSignIn && !passwordRegex.test(password)) {
    return {
      success: false,
      error: "Password too weak (needs 8 chars, letter, number, symbol).",
    };
  }
  if (!isSignIn && password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/${
        isSignIn ? "login" : "signup"
      }`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      },
    );
    const result = (await res.json()) as {
      success?: boolean;
      errorCode?: string;
    };
    if (!res.ok || !result.success) {
      const code = result.errorCode || "";
      const msg =
        code === "auth/email-already-in-use"
          ? "Email already in use. Try signing in."
          : [
                "auth/wrong-password",
                "auth/user-not-found",
                "auth/invalid-credential",
              ].includes(code)
            ? "Invalid email or password."
            : code === "auth/invalid-email"
              ? "Please enter a valid email address."
              : code === "auth/weak-password"
                ? "Password too weak (needs 8 chars, letter, number, symbol)."
                : "Authentication failed. Please try again.";
      return { success: false, error: msg };
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Authentication failed. Please try again.",
    };
  }
}
