"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./SessionContext";
import { useToast } from "./ToastContext";

type UseProtectedNavigationOptions = {
  onAuthorized?: () => void;
  buildToastMessage?: (label: string) => string;
};

const defaultToastMessage = (label: string) =>
  `Please sign in to view ${label}`;

export function useProtectedNavigation({
  onAuthorized,
  buildToastMessage = defaultToastMessage,
}: UseProtectedNavigationOptions = {}) {
  const { showToast } = useToast();
  const router = useRouter();

  const {
    session,
    refreshSession,
    setSignedIn,
    isAuthModalOpen,
    setIsAuthModalOpen,
    pendingRedirect,
    setPendingRedirect,
  } = useSession();

  const requireAuth = useCallback(
    async (path: string, label: string) => {
      try {
        const current =
          session.status === "ready" ? session : await refreshSession();

        if (current.signedIn) {
          onAuthorized?.();
          router.push(path);
          return;
        }

        showToast(buildToastMessage(label), "info");
        setPendingRedirect(path);
        setIsAuthModalOpen(true);
      } catch {
        setPendingRedirect(path);
        setIsAuthModalOpen(true);
      }
    },
    [
      buildToastMessage,
      onAuthorized,
      refreshSession,
      router,
      session,
      showToast,
      setIsAuthModalOpen,
      setPendingRedirect,
    ],
  );

  const handleLoginSuccess = useCallback(() => {
    setSignedIn(true);

    if (pendingRedirect) {
      onAuthorized?.();
      router.push(pendingRedirect);
      setPendingRedirect(null);
    }

    setIsAuthModalOpen(false);
  }, [
    onAuthorized,
    pendingRedirect,
    router,
    setSignedIn,
    setPendingRedirect,
    setIsAuthModalOpen,
  ]);

  const preloadAuthModal = useCallback(() => {
    void import("./authModal");
  }, []);

  return {
    isAuthModalOpen,
    setIsAuthModalOpen,
    requireAuth,
    handleLoginSuccess,
    preloadAuthModal,
  };
}
