"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import dynamic from "next/dynamic";

const AuthModal = dynamic(() => import("./authModal"), {
  ssr: false,
  loading: () => null,
});

interface NewsButtonProps {
  children?: ReactNode;
  className?: string;
}

const defaultClassName =
  "w-80 self-center rounded-lg bg-amber-300 px-2 py-1 text-center text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:outline hover:outline-white md:self-end";

export default function NewsButton({ children, className }: NewsButtonProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleClick = useCallback(async () => {
    // Optimistic check (instant, no network)
    const hasAuthData = Object.keys(localStorage).some((key) =>
      key.startsWith("firebase:authUser:")
    );

    if (hasAuthData) {
      router.push("/HHapi");
      return;
    }

    // Full check (only if optimistic fails)
    try {
      const { getAuth } = await import("../../../firebase.config");
      const auth = await getAuth();

      if (auth.currentUser) {
        router.push("/HHapi");
      } else {
        showToast("Please sign in to view News.", "info");
        setIsAuthModalOpen(true);
      }
    } catch {
      // Fallback to modal on error
      setIsAuthModalOpen(true);
    }
  }, [router, showToast]);

  const handleClose = useCallback(() => setIsAuthModalOpen(false), []);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthModalOpen(false);
    router.push("/HHapi");
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={className || defaultClassName}
      >
        {children ?? "Check It Out"}
      </button>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={handleClose}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}
