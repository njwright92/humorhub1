"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info";

const ToastContext = createContext<
  { showToast: (message: string, type: ToastType) => void } | undefined
>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

const TOAST_CONFIG: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: "bg-green-700", icon: "✓" },
  error: { bg: "bg-red-700", icon: "✗" },
  info: { bg: "bg-blue-700", icon: "ⓘ" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string, type: ToastType) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ msg, type });
    timeoutRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="animate-slide-in fixed top-24 left-1/2 z-50 -translate-x-1/2"
        >
          <div
            className={`flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold whitespace-nowrap text-zinc-200 shadow-lg ${TOAST_CONFIG[toast.type].bg}`}
          >
            <span aria-hidden="true">{TOAST_CONFIG[toast.type].icon}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
