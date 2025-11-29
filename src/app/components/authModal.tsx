"use client";

import React, { useState, useCallback, memo } from "react";
import { auth } from "../../../firebase.config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  type AuthError,
} from "firebase/auth";

// --- Types & Constants ---

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

// --- Icons ---

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
      className="social-signin-button w-full flex items-center justify-center p-2 rounded-lg shadow-lg transition-colors bg-zinc-100 text-zinc-900"
    >
      <span className="mr-3">{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  ),
);
SocialSignInButton.displayName = "SocialSignInButton";

// --- Main Component ---

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // CHANGED: Variable is now 'isSignIn' and defaults to TRUE
  const [isSignIn, setIsSignIn] = useState<boolean>(true);

  const handleAuth = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }
      if (!passwordRegex.test(password)) {
        alert(
          "Your password must be at least 8 characters long, contain a letter, a number, and a special character.",
        );
        return;
      }

      // Logic flipped: If NOT signing in, we are signing up
      if (!isSignIn && password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      try {
        if (!isSignIn) {
          // SIGN UP LOGIC
          await createUserWithEmailAndPassword(auth, email, password);
          alert("Sign-up successful! Please update your profile.");
        } else {
          // SIGN IN LOGIC
          await signInWithEmailAndPassword(auth, email, password);
          alert("Sign-in successful! Welcome back.");
        }
        onClose();
      } catch (error) {
        const authError = error as AuthError;
        if (authError.code) {
          switch (authError.code) {
            case "auth/email-already-in-use":
              alert("This email is already in use. Try signing in.");
              break;
            case "auth/wrong-password":
              alert("Incorrect password. Please try again.");
              break;
            case "auth/user-not-found":
              alert("No user found with this email. Please sign up.");
              break;
            default:
              alert(`Error: ${authError.message}. Please try again.`);
          }
        } else {
          alert(`An unexpected error occurred. Please try again.`);
        }
      }
    },
    [email, password, confirmPassword, isSignIn, onClose],
  );

  const handleSocialSignIn = useCallback(
    (provider: GoogleAuthProvider) => {
      signInWithPopup(auth, provider)
        .then((result) => {
          console.log(
            `${provider.providerId} sign-in successful:`,
            result.user,
          );
          onClose();
        })
        .catch((error) => {
          console.error(`Error during ${provider.providerId} sign-in:`, error);
          alert(`${provider.providerId} sign-in failed. Please try again.`);
        });
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 bg-zinc-600 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="modal-container bg-zinc-100 p-6 rounded-lg shadow-lg max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-900 hover:text-zinc-950 transition-colors p-2"
          aria-label="Close Modal"
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
            className="input-field w-full p-2 rounded-lg"
            autoComplete="email"
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
            className="input-field w-full p-2 rounded-lg"
            autoComplete={isSignIn ? "current-password" : "new-password"}
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
                className="input-field w-full p-2 rounded-lg"
                autoComplete="new-password"
              />
            </>
          )}

          <button
            type="submit"
            className={`w-full py-2 text-zinc-100 font-medium rounded-lg shadow-lg transition-colors mt-2 ${
              isSignIn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </button>

          <p className="mt-4 text-center text-sm text-zinc-900">
            {isSignIn ? (
              <>
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignIn(false)}
                  className="text-blue-600 underline cursor-pointer font-medium"
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
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </form>

        <div className="my-2 flex items-center">
          <p className="flex-shrink mx-auto text-zinc-900 text-sm">OR</p>
        </div>

        <SocialSignInButton
          onClick={() => handleSocialSignIn(new GoogleAuthProvider())}
          icon={<GoogleIcon />}
          label="Sign in with Google"
        />
      </div>
    </div>
  );
};

export default memo(AuthModal);
