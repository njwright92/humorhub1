import React, { useState, useCallback, useEffect } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
// OPTIMIZATION: Use the initialized instance instead of calling getAuth() repeatedly
import { auth } from "../../../firebase.config";

const ClientSignOutButton: React.FC = React.memo(() => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // OPTIMIZATION: Prefetch the home route for instant navigation
  useEffect(() => {
    router.prefetch("/");
  }, [router]);

  // OPTIMIZATION: Handle side effects (redirection) in one place
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Use 'replace' to prevent back-button navigation to protected pages
        router.replace("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
      alert("Signed out successfully");
      // We do not need router.push here; the useEffect above handles it automatically
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out, please try again.");
      setLoading(false); // Only stop loading on error
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
