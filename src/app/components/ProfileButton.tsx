"use client";

import type { ReactNode } from "react";
import ProtectedRouteButton from "./ProtectedRouteButton";

export default function ProfileButton({
  children = "Visit Your Profile",
  className = "primary-cta",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ProtectedRouteButton
      route="/Profile"
      label="Profile"
      className={className}
    >
      {children}
    </ProtectedRouteButton>
  );
}
