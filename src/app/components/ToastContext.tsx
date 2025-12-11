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

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Toast styling by type
const TOAST_STYLES: Record<ToastType, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-blue-600",
};

const TOAST_ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✗",
  info: "ℹ",
};

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showToast = useCallback((msg: string, type: ToastType) => {
    // Clear existing timeout to prevent stale dismissals
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ msg, type });

    timeoutRef.current = setTimeout(() => {
      setToast(null);
      timeoutRef.current = null;
    }, TOAST_DURATION);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          role="alert"
          aria-live="polite"
          aria-atomic="true"
          className="animate-fade-in fixed top-24 left-1/2 z-50 -translate-x-1/2"
        >
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 font-semibold whitespace-nowrap text-zinc-100 shadow-xl sm:px-6 ${TOAST_STYLES[toast.type]}`}
          >
            <span aria-hidden="true">{TOAST_ICONS[toast.type]}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
