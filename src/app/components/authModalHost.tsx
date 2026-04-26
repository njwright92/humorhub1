"use client";

import dynamic from "next/dynamic";
import { useSession } from "./SessionContext";
import { useProtectedNavigation } from "./useProtectedNavigation";

const AuthModal = dynamic(() => import("./authModal"));

export default function AuthModalHost() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useSession();
  const { handleLoginSuccess } = useProtectedNavigation();

  if (!isAuthModalOpen) return null;

  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
