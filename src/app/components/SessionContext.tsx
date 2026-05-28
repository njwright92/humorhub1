"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getSession, type SessionInfo } from "@/app/lib/auth-client";

type SessionState = SessionInfo & { status: "unknown" | "ready" };
const SESSION_CACHE_KEY = "humorhub-session";
const UNKNOWN_SESSION: SessionState = { signedIn: false, status: "unknown" };

type SessionContextValue = {
  session: SessionState;
  refreshSession: () => Promise<SessionState>;
  setSignedIn: (signedIn: boolean, info?: Partial<SessionInfo>) => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  pendingRedirect: string | null;
  setPendingRedirect: (path: string | null) => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

function cacheSession(session: SessionInfo) {
  try {
    if (typeof window === "undefined") return;
    if (session.signedIn) window.sessionStorage.setItem(SESSION_CACHE_KEY, "1");
    else window.sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    return;
  }
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(() => {
    try {
      return typeof window !== "undefined" &&
        window.sessionStorage.getItem(SESSION_CACHE_KEY) === "1"
        ? { signedIn: true, status: "ready" }
        : UNKNOWN_SESSION;
    } catch {
      return UNKNOWN_SESSION;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const inFlightRef = useRef<Promise<SessionState> | null>(null);

  const refreshSession = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;

    const request = getSession()
      .then((data) => {
        const next: SessionState = {
          signedIn: Boolean(data.signedIn),
          uid: data.uid,
          email: data.email,
          status: "ready",
        };
        cacheSession(next);
        setSession(next);
        return next;
      })
      .finally(() => {
        inFlightRef.current = null;
      });

    inFlightRef.current = request;
    return request;
  }, []);

  const setSignedIn = useCallback(
    (signedIn: boolean, info: Partial<SessionInfo> = {}) => {
      setSession((prev) => {
        const next = {
          ...prev,
          ...(signedIn ? {} : { uid: undefined, email: undefined }),
          ...info,
          signedIn,
          status: "ready" as const,
        };
        cacheSession(next);
        return next;
      });
    },
    [],
  );

  return (
    <SessionContext.Provider
      value={{
        session,
        refreshSession,
        setSignedIn,

        isAuthModalOpen,
        setIsAuthModalOpen,
        pendingRedirect,
        setPendingRedirect,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
