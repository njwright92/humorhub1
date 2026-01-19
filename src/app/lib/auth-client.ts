export type SessionInfo = {
  signedIn: boolean;
  uid?: string;
  email?: string;
};

export async function getSession(): Promise<SessionInfo> {
  try {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
    });
    const data = (await res.json()) as {
      success?: boolean;
      signedIn?: boolean;
      uid?: string;
      email?: string;
    };

    if (!res.ok || !data.success) return { signedIn: false };
    return {
      signedIn: Boolean(data.signedIn),
      uid: data.uid,
      email: data.email,
    };
  } catch {
    return { signedIn: false };
  }
}
