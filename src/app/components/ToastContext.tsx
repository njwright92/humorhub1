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

type ToastState = {
  msg: string;
  type: ToastType;
};

const ToastContext = createContext<
  | {
      showToast: (message: string, type: ToastType) => void;
    }
  | undefined
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

const DEFAULT_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const clearExistingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (msg: string, type: ToastType) => {
      clearExistingTimeout();
      setToast({ msg, type });
      timeoutRef.current = setTimeout(() => setToast(null), DEFAULT_DURATION);
    },
    [clearExistingTimeout],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="animate-slide-in fixed top-6 left-1/2 z-50 w-fit -translate-x-1/2"
        >
          <div
            className={`grid rounded-2xl px-2 py-1 text-center font-semibold text-zinc-200 shadow-xl ${TOAST_CONFIG[toast.type].bg}`}
          >
            <div className="grid auto-cols-max grid-flow-col items-center gap-2">
              <span aria-hidden="true">{TOAST_CONFIG[toast.type].icon}</span>
              <span>{toast.msg}</span>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
