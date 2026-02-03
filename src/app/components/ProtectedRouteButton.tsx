"use client";

import { useCallback, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useProtectedNavigation } from "./useProtectedNavigation";

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
  const router = useRouter();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    requireAuth,
    handleLoginSuccess,
    preloadAuthModal,
  } = useProtectedNavigation({
    buildToastMessage: (text) => `Please sign in to view ${text}.`,
  });

  const preload = useCallback(() => {
    preloadAuthModal();
    router.prefetch?.(route);
  }, [preloadAuthModal, router, route]);

  return (
    <>
      <button
        type="button"
        onPointerEnter={preload}
        onFocus={preload}
        onTouchStart={preload}
        onClick={() => void requireAuth(route, label)}
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
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
}
