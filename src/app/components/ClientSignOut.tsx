"use client";

import React from "react";
import { getAuth, signOut } from "firebase/auth";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

const ClientOnlySignOutButton: React.FC = () => {
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
      className="btn"
    >
      <ArrowRightOnRectangleIcon className="inline-block h-4 w-4 mr-1" />
      Sign Out
    </button>
  );
};

export default ClientOnlySignOutButton;
