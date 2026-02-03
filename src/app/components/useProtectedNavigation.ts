"use client";

import { useCallback, useState } from "react";
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
  const { session, refreshSession, setSignedIn } = useSession();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

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
  }, [onAuthorized, pendingRedirect, router, setSignedIn]);

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
