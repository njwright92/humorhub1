"use client";

import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const ClientSignOutButton: React.FC = () => {
  const router = useRouter(); // Initialize the router

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("Signed out successfully");
      router.push("/"); // Redirect to the home screen
    } catch (e) {
      if (e instanceof Error) {
        alert(`Error signing out: ${e.message}`);
      } else {
        alert("Unknown error occurred");
      }
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="btn hover:bg-rrange-600 transition-colors"
    >
      Sign Out
    </button>
  );
};

export default ClientSignOutButton;
