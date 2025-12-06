"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastContext";
import dynamic from "next/dynamic";
import type { Auth } from "firebase/auth";

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
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const authRef = useRef<Auth | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { auth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");
      authRef.current = auth as Auth;

      unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
        setIsUserSignedIn(!!user);
      });
    };

    initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleClick = () => {
    if (isUserSignedIn || authRef.current?.currentUser) {
      router.push("/HHapi");
    } else {
      showToast("Please sign in to view News.", "info");
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={className || "btn w-80 text-center self-center md:self-end"}
      >
        {children || "Check It Out"}
      </button>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={() => {
          setIsAuthModalOpen(false);
          router.push("/HHapi");
        }}
      />
    </>
  );
}
