"use client";

import React, { useState, useCallback, memo } from "react";
import { getAuth } from "../../../firebase.config";
import { useToast } from "./ToastContext";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type AuthError,
} from "firebase/auth";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const GoogleIcon = memo(() => (
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
));
GoogleIcon.displayName = "GoogleIcon";

interface SocialButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const SocialSignInButton = memo<SocialButtonProps>(
  ({ onClick, icon, label }) => (
    <button
      onClick={onClick}
      className="social-signin-button w-full flex items-center justify-center p-2 rounded-lg shadow-lg transition-colors bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
    >
      <span className="mr-3">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  ),
);
SocialSignInButton.displayName = "SocialSignInButton";

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

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
        const auth = await getAuth();

        if (!isSignIn) {
          await createUserWithEmailAndPassword(auth, email, password);
          showToast("Sign-up successful! Welcome.", "success");
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          showToast("Sign-in successful! Welcome back.", "success");
        }

        onLoginSuccess?.();
        onClose();
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
      onClose,
      onLoginSuccess,
      showToast,
    ],
  );

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const auth = await getAuth();
      await signInWithPopup(auth, new GoogleAuthProvider());
      showToast("Google sign-in successful!", "success");
      onLoginSuccess?.();
      onClose();
    } catch (error: unknown) {
      const authError = error as AuthError;
      if (authError.code === "auth/popup-blocked") {
        showToast("Popup blocked. Please allow popups.", "error");
      } else if (authError.code !== "auth/popup-closed-by-user") {
        showToast("Google sign-in failed.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }, [onClose, onLoginSuccess, showToast]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur">
      <div className="modal-container bg-zinc-300 p-6 rounded-lg shadow-lg max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-900 hover:text-zinc-950 transition-colors p-2"
          aria-label="Close Modal"
          disabled={isLoading}
        >
          <svg
            className="h-6 w-6"
            role="button"
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
        </button>

        <h2 className="modal-title text-2xl font-bold text-center mb-4 text-zinc-900">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h2>

        <form onSubmit={handleAuth} className="form-container space-y-3">
          <label htmlFor="email" className="block text-sm text-zinc-900">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input-field bg-zinc-100 w-full p-2 rounded-lg"
            autoComplete="email"
            disabled={isLoading}
          />

          <label htmlFor="password" className="block text-sm text-zinc-900">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-field bg-zinc-100 w-full p-2 rounded-lg"
            autoComplete={isSignIn ? "current-password" : "new-password"}
            disabled={isLoading}
          />

          {!isSignIn && (
            <>
              <label
                htmlFor="confirmPassword"
                className="block text-sm text-zinc-900"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="input-field w-full bg-zinc-100 p-2 rounded-lg"
                autoComplete="new-password"
                disabled={isLoading}
              />
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 text-zinc-100 font-medium rounded-lg shadow-lg transition-colors mt-2 disabled:opacity-50 ${
              isSignIn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Loading..." : isSignIn ? "Sign In" : "Sign Up"}
          </button>

          <p className="mt-4 text-center text-sm text-zinc-900">
            {isSignIn ? (
              <>
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignIn(false)}
                  className="text-blue-600 underline cursor-pointer font-medium"
                  disabled={isLoading}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignIn(true)}
                  className="text-blue-600 underline cursor-pointer font-medium"
                  disabled={isLoading}
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </form>

        <div className="my-2 flex items-center">
          <p className="shrink mx-auto text-zinc-900 text-sm">OR</p>
        </div>

        <SocialSignInButton
          onClick={handleGoogleSignIn}
          icon={<GoogleIcon />}
          label={isLoading ? "Loading..." : "Sign in with Google"}
        />
      </div>
    </div>
  );
};

export default memo(AuthModal);
