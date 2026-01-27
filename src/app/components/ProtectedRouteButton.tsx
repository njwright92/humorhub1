"use client";

import { useState, useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import { useSession } from "./SessionContext";

const AuthModal = dynamic(() => import("./authModal"));

export default function ProtectedRouteButton({
  route,
  label,
  className,
  children,
}: {
  route: string;
  label: string;
  className: string;
  children: ReactNode;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { session, refreshSession, setSignedIn } = useSession();

  const preload = useCallback(() => {
    void import("./authModal");
    router.prefetch?.(route);
  }, [router, route]);

  const handleClick = useCallback(async () => {
    try {
      const current =
        session.status === "ready" ? session : await refreshSession();
      if (current.signedIn) {
        router.push(route);
        return;
      }

      showToast(`Please sign in to view ${label}.`, "info");
      setIsAuthModalOpen(true);
    } catch {
      setIsAuthModalOpen(true);
    }
  }, [label, refreshSession, router, route, session, showToast]);

  return (
    <>
      <button
        type="button"
        onPointerEnter={preload}
        onFocus={preload}
        onTouchStart={preload}
        onClick={handleClick}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={isAuthModalOpen}
      >
        {children}
      </button>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={() => {
            setSignedIn(true);
            setIsAuthModalOpen(false);
            router.push(route);
          }}
        />
      )}
    </>
  );
}
