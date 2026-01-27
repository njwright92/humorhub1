"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getSession, type SessionInfo } from "@/app/lib/auth-client";

type SessionState = SessionInfo & { status: "loading" | "ready" };

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
    status: "loading",
  });
  const initRef = useRef(false);

  const refreshSession = useCallback(async () => {
    const data = await getSession();
    const next: SessionState = {
      signedIn: Boolean(data.signedIn),
      uid: data.uid,
      email: data.email,
      status: "ready",
    };
    setSession(next);
    return next;
  }, []);

  const setSignedIn = useCallback(
    (signedIn: boolean, info: Partial<SessionInfo> = {}) => {
      setSession((prev) => ({
        ...prev,
        ...info,
        signedIn,
        status: "ready",
      }));
    },
    [],
  );

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const timer = setTimeout(() => {
      void refreshSession();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshSession]);

  return (
    <SessionContext.Provider value={{ session, refreshSession, setSignedIn }}>
      {children}
    </SessionContext.Provider>
  );
}
