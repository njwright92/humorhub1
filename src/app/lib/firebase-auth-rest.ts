export type FirebaseAuthError = {
  error: { message?: string };
};

export function mapFirebaseAuthErrorCode(code?: string): string {
  switch (code) {
    case "EMAIL_EXISTS":
      return "auth/email-already-in-use";
    case "EMAIL_NOT_FOUND":
      return "auth/user-not-found";
    case "INVALID_PASSWORD":
      return "auth/wrong-password";
    case "INVALID_LOGIN_CREDENTIALS":
      return "auth/invalid-credential";
    case "WEAK_PASSWORD":
      return "auth/weak-password";
    case "INVALID_EMAIL":
      return "auth/invalid-email";
    case "MISSING_PASSWORD":
      return "auth/missing-password";
    case "OPERATION_NOT_ALLOWED":
      return "auth/operation-not-allowed";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
      return "auth/too-many-requests";
    default:
      return "auth/unknown";
  }
}

export async function callIdentityToolkit<T>(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<T> {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing FIREBASE_API_KEY environment variable");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!res.ok) {
    const error = (await res.json()) as FirebaseAuthError;
    const message = error?.error?.message;
    const code = mapFirebaseAuthErrorCode(message);
    const err = new Error(message || "Auth request failed");
    (err as { code?: string }).code = code;
    throw err;
  }

  return (await res.json()) as T;
}
