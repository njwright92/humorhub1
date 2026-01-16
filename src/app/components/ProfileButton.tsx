"use client";

import { useState, useCallback, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import dynamic from "next/dynamic";
import type { User } from "firebase/auth";

const AuthModal = dynamic(() => import("./authModal"));

export default function ProfileButton({
  children = "Visit Your Profile",
  className = "primary-cta",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    router.prefetch?.("/Profile");
  }, [router, getAuthUser]);

  const handleClick = useCallback(async () => {
    try {
      const user = await getAuthUser();

      if (user) {
        router.push("/Profile");
        return;
      }

      showToast("Please sign in to view Profile.", "info");
      setIsAuthModalOpen(true);
    } catch {
      setIsAuthModalOpen(true);
    }
  }, [router, showToast, getAuthUser]);

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
            setIsAuthModalOpen(false);
            router.push("/Profile");
          }}
        />
      )}
    </>
  );
}
