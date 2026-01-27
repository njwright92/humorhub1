"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "./ToastContext";
import { SessionProvider } from "./SessionContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  );
}
