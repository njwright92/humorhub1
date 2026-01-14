"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { User } from "firebase/auth";
import { useToast } from "./ToastContext";

const AuthModal = dynamic(() => import("./authModal"));

export default function ProtectedLinkButton({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const authPromiseRef = useRef<Promise<User | null> | null>(null);

  const getAuthUser = useCallback(() => {
    if (!authPromiseRef.current) {
      authPromiseRef.current = (async () => {
        const { getAuth } = await import("@/app/lib/firebase-auth");
        const auth = await getAuth();
        await auth.authStateReady();
        return auth.currentUser;
      })();
    }
    return authPromiseRef.current;
  }, []);

  const preload = useCallback(() => {
    void import("./authModal");
    void getAuthUser();
  }, [getAuthUser]);

  const handleClick = useCallback(async () => {
    const user = await getAuthUser();
    if (user) {
      router.push(href);
      return;
    }
    showToast(`Please sign in to view ${label}`, "info");
    setPendingRedirect(href);
    setIsAuthModalOpen(true);
  }, [getAuthUser, router, href, label, showToast]);

  return (
    <>
      <button
        type="button"
        onPointerEnter={preload}
        onFocus={preload}
        onTouchStart={preload}
        onClick={handleClick}
        className={className}
        aria-label={label}
      >
        {children}
      </button>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={() => {
            authPromiseRef.current = null;
            setIsAuthModalOpen(false);
            if (pendingRedirect) {
              router.push(pendingRedirect);
              setPendingRedirect(null);
            }
          }}
        />
      )}
    </>
  );
}
