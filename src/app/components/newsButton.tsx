"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import dynamic from "next/dynamic";

// Only load modal if needed
const AuthModal = dynamic(() => import("./authModal"), {
  ssr: false,
  loading: () => null,
});

interface Props {
  children?: React.ReactNode;
  className?: string;
}

export default function NewsButton({ children, className }: Props) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleClick = useCallback(async () => {
    // 1. Optimistic Check (Instant)
    const hasAuthData =
      typeof window !== "undefined" &&
      Object.keys(window.localStorage).some((key) =>
        key.startsWith("firebase:authUser:"),
      );

    if (hasAuthData) {
      router.push("/HHapi");
      return;
    }

    // 2. Slow Check (Only if optimistic fails)
    // Dynamically import auth only on click!
    try {
      const { getAuth } = await import("../../../firebase.config");
      const auth = await getAuth();

      if (auth.currentUser) {
        router.push("/HHapi");
      } else {
        // Not signed in
        showToast("Please sign in to view News.", "info");
        setIsAuthModalOpen(true);
      }
    } catch (error) {
      console.error("Auth check failed", error);
      // Fallback to showing modal if anything fails
      setIsAuthModalOpen(true);
    }
  }, [router, showToast]);

  return (
    <>
      <button
        onClick={handleClick}
        className={
          className ||
          "bg-amber-300 text-white px-2 py-1 rounded-lg shadow-lg font-semibold text-lg transform transition-transform hover:scale-105 hover:outline hover:outline-white w-80 text-center self-center md:self-end cursor-pointer"
        }
      >
        {children || "Check It Out"}
      </button>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={() => {
            setIsAuthModalOpen(false);
            router.push("/HHapi");
          }}
        />
      )}
    </>
  );
}
