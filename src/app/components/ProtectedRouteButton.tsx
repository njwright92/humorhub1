"use client";

import { useState, useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import { getSession } from "@/app/lib/auth-client";

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

  const preload = useCallback(() => {
    void import("./authModal");
    void getSession();
    router.prefetch?.(route);
  }, [router, route]);

  const handleClick = useCallback(async () => {
    try {
      const user = await getSession();
      if (user.signedIn) {
        router.push(route);
        return;
      }

      showToast(`Please sign in to view ${label}.`, "info");
      setIsAuthModalOpen(true);
    } catch {
      setIsAuthModalOpen(true);
    }
  }, [label, router, route, showToast]);

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
            router.push(route);
          }}
        />
      )}
    </>
  );
}
