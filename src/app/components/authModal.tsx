"use client";

import React, { useState, useCallback, memo } from "react";
import { useToast } from "./ToastContext";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
};

type AuthError = {
  code: string;
  message: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const GoogleIcon = memo(function GoogleIcon() {
  return (
    <svg height="20" width="20" viewBox="0 0 20 20" focusable="false">
      <path
        d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
        fill="#4285F4"
      />
      <path
        d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
        fill="#34A853"
      />
      <path
        d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
        fill="#EA4335"
      />
    </svg>
  );
});

const CloseIcon = memo(function CloseIcon() {
  return (
    <svg
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
});

interface SocialButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

const SocialSignInButton = memo(function SocialSignInButton({
  onClick,
  icon,
  label,
  disabled,
}: SocialButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center rounded-2xl bg-zinc-200 p-2 text-stone-900 shadow-lg transition-colors hover:bg-zinc-200 disabled:opacity-50"
    >
      <span className="mr-3">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
});

function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
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
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address.", "error");
        return;
      }
      if (!passwordRegex.test(password)) {
        showToast(
          "Password too weak (needs 8 chars, letter, number, symbol).",
          "error"
        );
        return;
      }
      if (!isSignIn && password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }

      setIsLoading(true);
      try {
        const [
          { getAuth },
          { createUserWithEmailAndPassword, signInWithEmailAndPassword },
        ] = await Promise.all([
          import("../../../firebase.config"),
          import("firebase/auth"),
        ]);

        const auth = await getAuth();

        if (!isSignIn) {
          await createUserWithEmailAndPassword(auth, email, password);
          showToast("Sign-up successful! Welcome.", "success");
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          showToast("Sign-in successful! Welcome back.", "success");
        }

        onLoginSuccess?.();
        handleClose();
      } catch (error) {
        const authError = error as AuthError;
        if (authError.code === "auth/email-already-in-use") {
          showToast("Email already in use. Try signing in.", "error");
        } else if (
          authError.code === "auth/wrong-password" ||
          authError.code === "auth/user-not-found" ||
          authError.code === "auth/invalid-credential"
        ) {
          showToast("Invalid email or password.", "error");
        } else {
          showToast(authError.message, "error");
        }
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
    ]
  );

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ getAuth }, { GoogleAuthProvider, signInWithPopup }] =
        await Promise.all([
          import("../../../firebase.config"),
          import("firebase/auth"),
        ]);

      const auth = await getAuth();
      await signInWithPopup(auth, new GoogleAuthProvider());
      showToast("Google sign-in successful!", "success");
      onLoginSuccess?.();
      handleClose();
    } catch (error) {
      const authError = error as AuthError;
      if (authError.code === "auth/popup-blocked") {
        showToast("Popup blocked. Please allow popups.", "error");
      } else if (authError.code !== "auth/popup-closed-by-user") {
        showToast("Google sign-in failed.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleClose, onLoginSuccess, showToast]);

  const toggleMode = useCallback(() => {
    setIsSignIn((prev) => !prev);
    setConfirmPassword("");
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-stone-300 p-6 shadow-lg">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 text-stone-900 transition-colors hover:text-stone-900"
          aria-label="Close modal"
          disabled={isLoading}
          type="button"
        >
          <CloseIcon />
        </button>

        <h2
          id="auth-modal-title"
          className="mb-4 text-center text-2xl font-bold text-stone-900"
        >
          {isSignIn ? "Sign In" : "Sign Up"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-3" noValidate>
          <div>
            <label
              htmlFor="auth-email"
              className="mb-1 block text-sm text-stone-900"
            >
              Email
            </label>
            <input
              type="email"
              id="auth-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl bg-zinc-200 p-2 text-left"
              autoComplete="email"
              disabled={isLoading}
              required
              aria-required="true"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1 block text-sm text-stone-900"
            >
              Password
            </label>
            <input
              type="password"
              id="auth-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl bg-zinc-200 p-2 text-left"
              autoComplete={isSignIn ? "current-password" : "new-password"}
              disabled={isLoading}
              required
              aria-required="true"
            />
          </div>

          {!isSignIn && (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="mb-1 block text-left text-sm text-stone-900"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="auth-confirm-password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl bg-zinc-200 p-2"
                autoComplete="new-password"
                disabled={isLoading}
                required
                aria-required="true"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`mt-2 w-full rounded-2xl py-2 font-semibold text-white shadow-lg transition-colors disabled:opacity-50 ${
              isSignIn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Loading..." : isSignIn ? "Sign In" : "Sign Up"}
          </button>

          <p className="mt-4 text-center text-sm text-stone-900">
            {isSignIn ? "Need an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              disabled={isLoading}
              className="font-medium text-blue-600 underline"
            >
              {isSignIn ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>

        <div
          className="my-3 text-center text-sm text-stone-900"
          aria-hidden="true"
        >
          OR
        </div>

        <SocialSignInButton
          onClick={handleGoogleSignIn}
          icon={<GoogleIcon />}
          label={isLoading ? "Loading..." : "Sign in with Google"}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}

export default memo(AuthModal);
