"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import dynamic from "next/dynamic";
import { getSession } from "@/app/lib/auth-client";

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

  const preload = useCallback(() => {
    void import("./authModal");
    void getSession();
    router.prefetch?.("/Profile");
  }, [router]);

  const handleClick = useCallback(async () => {
    try {
      const user = await getSession();

      if (user.signedIn) {
        router.push("/Profile");
        return;
      }

      showToast("Please sign in to view Profile.", "info");
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
            router.push("/Profile");
          }}
        />
      )}
    </>
  );
}
