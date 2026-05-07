"use client";

import { useState, useCallback, type SubmitEvent } from "react";
import { useToast } from "./ToastContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAuth } from "@/app/lib/firebase-auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const inputClass = "field-soft";

function getFirebaseErrorCode(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return "";
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = useCallback(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setIsSignIn(true);
    onClose();
  }, [onClose]);

  const handleAuth = useCallback(
    async (e: SubmitEvent) => {
      e.preventDefault();

      if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address.", "error");
        return;
      }

      if (!isSignIn && !passwordRegex.test(password)) {
        showToast(
          "Password too weak (needs 8 chars, letter, number, symbol).",
          "error",
        );
        return;
      }

      if (!isSignIn && password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/auth/${isSignIn ? "login" : "signup"}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });
        const result = (await res.json()) as {
          success?: boolean;
          errorCode?: string;
        };

        if (!res.ok || !result.success) {
          const code = result.errorCode || "";
          const msg =
            code === "auth/email-already-in-use"
              ? "Email already in use. Try signing in."
              : [
                    "auth/wrong-password",
                    "auth/user-not-found",
                    "auth/invalid-credential",
                  ].includes(code)
                ? "Invalid email or password."
                : code === "auth/invalid-email"
                  ? "Please enter a valid email address."
                  : code === "auth/weak-password"
                    ? "Password too weak (needs 8 chars, letter, number, symbol)."
                    : "Authentication failed. Please try again.";
          showToast(msg, "error");
          return;
        }

        showToast(
          isSignIn
            ? "Sign-in successful! Welcome back."
            : "Sign-up successful! Welcome.",
          "success",
        );
        onLoginSuccess?.();
        handleClose();
      } catch {
        showToast("Authentication failed. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      email,
      password,
      confirmPassword,
      isSignIn,
      handleClose,
      onLoginSuccess,
      showToast,
    ],
  );

  const handleGoogleSignIn = useCallback(() => {
    setIsLoading(true);

    void (async () => {
      try {
        const auth = await getAuth();
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        const res = await fetch("/api/auth/session-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        });

        const sessionResult = (await res.json()) as { success?: boolean };
        if (!res.ok || !sessionResult.success) {
          throw new Error("session-cookie-failed");
        }

        showToast("Google sign-in successful!", "success");
        onLoginSuccess?.();
        handleClose();
      } catch (error: unknown) {
        const code = getFirebaseErrorCode(error);

        if (code === "auth/popup-blocked") {
          showToast(
            "Popup blocked. Enable popups in Safari settings.",
            "error",
          );
        } else if (code !== "auth/popup-closed-by-user") {
          showToast("Google sign-in failed.", "error");
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, [handleClose, onLoginSuccess, showToast]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
    >
      <div
        className="card-shell relative w-full max-w-sm space-y-3 bg-zinc-200 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-stone-900 transition-colors hover:text-stone-700"
          aria-label="Close modal"
          disabled={isLoading}
          type="button"
        >
          <svg
            className="size-8"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <h2 id="auth-title" className="text-center text-2xl text-stone-900">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-3" noValidate>
          <div className="space-y-1">
            <label htmlFor="auth-email" className="text-sm text-stone-900">
              Email
            </label>
            <input
              type="email"
              id="auth-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
              autoComplete="email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-password" className="text-sm text-stone-900">
              Password
            </label>
            <input
              type="password"
              id="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              autoComplete={isSignIn ? "current-password" : "new-password"}
              disabled={isLoading}
              required
            />
          </div>

          {!isSignIn && (
            <div className="space-y-1">
              <label htmlFor="auth-confirm" className="text-sm text-stone-900">
                Confirm Password
              </label>
              <input
                type="password"
                id="auth-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                autoComplete="new-password"
                disabled={isLoading}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-2xl py-2 font-semibold text-white shadow-xl transition-colors disabled:opacity-50 ${
              isSignIn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Loading..." : isSignIn ? "Sign In" : "Sign Up"}
          </button>

          <p className="text-center text-sm text-stone-900">
            {isSignIn ? "Need an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignIn((p) => !p);
                setConfirmPassword("");
              }}
              disabled={isLoading}
              className="font-medium text-blue-600 underline"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>

        <p className="text-center text-sm text-stone-900" aria-hidden="true">
          OR
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-300 bg-white p-2.5 text-sm font-bold text-stone-900 shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="size-5 shrink-0"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
        </button>
      </div>
    </div>
  );
}
