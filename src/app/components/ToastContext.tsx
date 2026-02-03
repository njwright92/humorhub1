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
type ToastActionVariant = "primary" | "danger" | "ghost";

type ToastAction = {
  label: string;
  onClick?: () => void | Promise<void>;
  variant?: ToastActionVariant;
};

type ToastOptions = {
  durationMs?: number | null;
  actions?: ToastAction[];
};

type ToastState = {
  msg: string;
  type: ToastType;
  actions: ToastAction[];
  durationMs: number | null;
};

const ToastContext = createContext<
  | {
      showToast: (
        message: string,
        type: ToastType,
        options?: ToastOptions,
      ) => void;
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
const ACTION_DURATION = 8000;

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
    (msg: string, type: ToastType, options: ToastOptions = {}) => {
      clearExistingTimeout();

      const actions = options.actions ?? [];
      const durationMs =
        options.durationMs === 0
          ? null
          : (options.durationMs ??
            (actions.length > 0 ? ACTION_DURATION : DEFAULT_DURATION));

      setToast({ msg, type, actions, durationMs });

      if (durationMs) {
        timeoutRef.current = setTimeout(() => setToast(null), durationMs);
      }
    },
    [clearExistingTimeout],
  );

  const handleActionClick = useCallback(
    async (action: ToastAction) => {
      clearExistingTimeout();
      setToast(null);
      try {
        await action.onClick?.();
      } catch (error) {
        console.error("Toast action error:", error);
      }
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
            className={`grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl px-2 py-1 text-center font-semibold text-zinc-200 shadow-xl ${TOAST_CONFIG[toast.type].bg}`}
          >
            <div className="grid gap-2">
              <div className="grid auto-cols-max grid-flow-col items-center gap-2">
                <span aria-hidden="true">{TOAST_CONFIG[toast.type].icon}</span>
                <span>{toast.msg}</span>
              </div>
              {toast.actions.length > 0 && (
                <div className="grid auto-cols-max grid-flow-col gap-2">
                  {toast.actions.map((action, idx) => (
                    <button
                      key={`${action.label}-${idx}`}
                      type="button"
                      onClick={() => void handleActionClick(action)}
                      className={`rounded-2xl px-2 py-1 font-semibold transition-colors ${getActionClass(action.variant)}`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

function getActionClass(variant: ToastActionVariant = "primary") {
  switch (variant) {
    case "danger":
      return "bg-red-600 text-white hover:bg-red-500";
    case "ghost":
      return "border border-zinc-300 text-zinc-200 hover:border-white hover:text-white";
    default:
      return "bg-amber-500 text-stone-900 hover:bg-amber-400";
  }
}
