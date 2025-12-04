import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Auth } from "firebase/auth";

const ClientSignOutButton: React.FC = React.memo(() => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const authRef = useRef<Auth | null>(null);

  // Prefetch the home route for instant navigation
  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  // Dynamic auth import + listener
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { auth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");

      authRef.current = auth as Auth;

      unsubscribe = onAuthStateChanged(auth as Auth, (user) => {
        if (!user) {
          router.replace("/");
        }
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      const { signOut } = await import("firebase/auth");

      if (authRef.current) {
        await signOut(authRef.current);
        alert("Signed out successfully");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out, please try again.");
      setLoading(false);
    }
  }, []);

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="bg-red-700 text-zinc-200 px-4 py-1 rounded-full transition-transform transform hover:scale-105 hover:underline focus:outline-none disabled:opacity-50"
    >
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
});

ClientSignOutButton.displayName = "ClientSignOutButton";

export default ClientSignOutButton;
