"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import dynamic from "next/dynamic";

const AuthModal = dynamic(() => import("./authModal"));

export default function NewsButton({
  children = "Check It Out",
  className = "w-70 self-center rounded-2xl bg-amber-700 px-2 py-1 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:outline hover:outline-white md:w-80 md:self-end",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleClick = useCallback(async () => {
    try {
      const { getAuth } = await import("../../../firebase.config");
      const auth = await getAuth();

      if (auth.currentUser) {
        router.push("/news");
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
            router.push("/news");
          }}
        />
      )}
    </>
  );
}
