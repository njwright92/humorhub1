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

type SessionContextValue = {
  session: SessionState;
  refreshSession: () => Promise<SessionState>;
  setSignedIn: (signedIn: boolean, info?: Partial<SessionInfo>) => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({
    signedIn: false,
    status: "unknown",
  });
  const inFlightRef = useRef<Promise<SessionState> | null>(null);

  const refreshSession = useCallback(async () => {
    if (inFlightRef.current) {
      return inFlightRef.current;
    }

    const request = getSession()
      .then((data) => {
        const next: SessionState = {
          signedIn: Boolean(data.signedIn),
          uid: data.uid,
          email: data.email,
          status: "ready",
        };
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
      setSession((prev) => ({
        ...prev,
        ...(signedIn ? {} : { uid: undefined, email: undefined }),
        ...info,
        signedIn,
        status: "ready",
      }));
    },
    [],
  );

  return (
    <SessionContext.Provider value={{ session, refreshSession, setSignedIn }}>
      {children}
    </SessionContext.Provider>
  );
}
