"use client";

import React, { useState, useCallback, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const ClientSignOutButton: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("Signed out successfully");
      router.push("/");
    } catch (e) {
      if (e instanceof Error) {
        alert(`Error signing out`);
      } else {
        alert("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      className="btn hover:bg-red-600 transition-colors text:no-wrap"
    >
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
};

export default ClientSignOutButton;
