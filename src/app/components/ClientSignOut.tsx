"use client";

import React from "react";
import { getAuth, signOut } from "firebase/auth";

const ClientSignOutButton: React.FC = () => {
  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("Signed out successfully");
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
      className="btn hover:bg-orange-600 transition-colors"
    >
      Sign Out
    </button>
  );
};

export default ClientSignOutButton;
