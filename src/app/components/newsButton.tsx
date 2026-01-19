"use client";

import type { ReactNode } from "react";
import ProtectedRouteButton from "./ProtectedRouteButton";

export default function NewsButton({
  children = "Check It Out",
  className = "w-72 justify-self-center rounded-2xl bg-amber-700 px-2 py-1 text-lg font-bold text-stone-900 transition-transform hover:scale-105 hover:outline hover:outline-white md:w-80 md:justify-self-end cursor-pointer",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ProtectedRouteButton route="/News" label="News" className={className}>
      {children}
    </ProtectedRouteButton>
  );
}
