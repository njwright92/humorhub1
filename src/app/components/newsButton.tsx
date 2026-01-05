"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import dynamic from "next/dynamic";

const AuthModal = dynamic(() => import("./authModal"));

export default function NewsButton({
  children = "Check It Out",
  className = "w-72 justify-self-center rounded-2xl bg-amber-700 px-2 py-1 text-lg font-bold text-white transition-transform hover:scale-105 hover:outline hover:outline-white md:w-80 md:justify-self-end",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const preload = useCallback(() => {
    void import("./authModal");
    void import("../../../firebase.config");
    router.prefetch?.("/News");
  }, [router]);

  const handleClick = useCallback(async () => {
    try {
      const { getAuth } = await import("../../../firebase.config");
      const auth = await getAuth();

      if (auth.currentUser) {
        router.push("/News");
        return;
      }

      showToast("Please sign in to view News.", "info");
      setIsAuthModalOpen(true);
    } catch {
      setIsAuthModalOpen(true);
    }
  }, [router, showToast]);

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
            router.push("/News");
          }}
        />
      )}
    </>
  );
}
