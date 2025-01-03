import React, { useState, useCallback, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const ClientSignOutButton: React.FC = React.memo(() => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out, please try again.");
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
      className="bg-red-500 text-zinc-100 px-4 py-1 rounded-full transition-transform transform hover:scale-105 hover:underline focus:outline-none disabled:opacity-50"
    >
      {loading ? "Signing Out..." : "Sign Out"}
    </button>
  );
});

// Set the display name for the memoized component
ClientSignOutButton.displayName = "ClientSignOutButton";

export default ClientSignOutButton;
