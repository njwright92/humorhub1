"use client";

import React, { useState, useCallback } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  AuthError,
} from "firebase/auth";
import { XMarkIcon } from "@heroicons/react/24/solid";

// Type for the modal props
type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(true);

  const handleAuth = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const auth = getAuth();

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

      if (isSignUp && password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      try {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email, password);
          alert("Sign-up successful! Please update your profile.");
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          alert("Sign-in successful! Welcome back.");
        }
        onClose();
      } catch (error) {
        if (error instanceof Error) {
          const authError = error as AuthError;
          switch (authError.code) {
            case "auth/email-already-in-use":
              alert("This email is already in use. Try signing in.");
              break;
            case "auth/wrong-password":
              alert("Incorrect password. Please try again.");
              break;
            default:
              alert(`Error: ${authError.message}. Please try again.`);
          }
        }
      }
    },
    [email, password, confirmPassword, isSignUp, onClose],
  );

  const handleGoogleSignIn = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Google sign-in successful:", result.user);
        onClose(); // Close the modal on successful sign-in
      })
      .catch((error) => {
        console.error("Error during Google sign-in:", error.message);
        alert("Google sign-in failed. Please try again.");
      });
  };

  if (!isOpen) return null;

  const handleTwitterSignIn = () => {
    const auth = getAuth();
    const provider = new TwitterAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Twitter sign-in successful:", result.user);
        onClose(); // Close the modal on successful sign-in
      })
      .catch((error) => {
        console.error(
          "Error during Twitter sign-in:",
          error.code,
          error.message,
        );
        alert("Twitter sign-in failed. Please try again.");
      });
  };

  const handleFacebookSignIn = () => {
    const auth = getAuth();
    const provider = new FacebookAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("Facebook sign-in successful:", result.user);
        onClose(); // Close the modal on successful sign-in
      })
      .catch((error) => {
        console.error(
          "Error during Facebook sign-in:",
          error.code,
          error.message,
        );
        alert("Facebook sign-in failed. Please try again.");
      });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <h2 className="modal-title">{isSignUp ? "Sign Up" : "Sign In"}</h2>
        <form onSubmit={handleAuth} className="form-container">
          <label htmlFor="email" className="text-zinc-900">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input-field"
            autoComplete="email"
          />
          <label htmlFor="password" className="text-zinc-900">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="input-field"
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
          {isSignUp && (
            <>
              <label htmlFor="confirmPassword" className="text-zinc-900">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="input-field"
                autoComplete="new-password"
              />
            </>
          )}
          <button type="submit" className="btn auth-button text-orange-600">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
          <p className="mt-4 text-center text-zinc-900">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Sign In
                </span>
              </>
            ) : (
              <>
                Need an account?{" "}
                <span
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Sign Up
                </span>
              </>
            )}
          </p>
        </form>
        {/* Google Sign-In Button */}
        <div className="mt-4 mx-auto">
          <button onClick={handleGoogleSignIn} className="social-signin-button">
            <span className="mr-2">
              {/* Google SVG */}
              <svg height="20" width="20" viewBox="0 0 20 20" focusable="false">
                <path
                  d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
                  fill="#34A853"
                ></path>
                <path
                  d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
                  fill="#EA4335"
                ></path>
              </svg>
            </span>
            <span className="whitespace-nowrap">Sign in with Google</span>
          </button>
        </div>

        {/* Twitter Sign-In Button */}
        <div className="mt-2 mx-auto">
          <button
            onClick={handleTwitterSignIn}
            className="social-signin-button"
          >
            <span className="mr-2">
              {/* Twitter SVG */}
              <svg height="20" width="20" viewBox="0 0 20 20" focusable="false">
                <path
                  d="M20 3.924a8.212 8.212 0 01-2.357.646 4.111 4.111 0 001.804-2.27c-.792.47-1.67.812-2.605.996A4.103 4.103 0 009.85 7.038a11.645 11.645 0 01-8.458-4.287 4.118 4.118 0 00-.555 2.066 4.1 4.1 0 001.825 3.415 4.074 4.074 0 01-1.858-.513v.052a4.105 4.105 0 003.29 4.022 4.01 4.01 0 01-1.852.072 4.106 4.106 0 003.833 2.85A8.268 8.268 0 010 16.411a11.602 11.602 0 006.29 1.846c7.547 0 11.674-6.253 11.674-11.675 0-.18-.004-.355-.01-.53.8-.58 1.496-1.3 2.046-2.125"
                  fill="#55ACEE"
                  fillRule="evenodd"
                ></path>
              </svg>
            </span>
            <span className="whitespace-nowrap">Sign in with Twitter</span>
          </button>
        </div>

        {/* Facebook Sign-In Button */}
        <div className="mt-2 mx-auto">
          <button
            onClick={handleFacebookSignIn}
            className="social-signin-button"
          >
            <span className="mr-2">
              {/* Facebook SVG */}
              <svg height="20" width="20" viewBox="0 0 20 20" focusable="false">
                <path
                  d="M18.896 0H1.104C.494 0 0 .494 0 1.104v17.792C0 19.506.494 20 1.104 20h9.588v-7.745H8.077V9.326h2.615V7.118c0-2.593 1.583-4.006 3.894-4.006 1.108 0 2.062.082 2.338.12v2.713l-1.606.001c-1.259 0-1.504.599-1.504 1.478v1.94h3.008l-.392 2.929h-2.616V20h5.127C19.506 20 20 19.506 20 18.896V1.104C20 .494 19.506 0 18.896 0z"
                  fill="#1877F2"
                ></path>
                <path
                  d="M13.5 20v-7.745h2.616l.392-2.929H13.5V7.386c0-.879.245-1.478 1.504-1.478l1.606-.001V3.193c-.276-.038-1.23-.12-2.338-.12-2.311 0-3.894 1.413-3.894 4.006v2.208H8.077v2.929h2.615V20h2.808z"
                  fill="#FFF"
                ></path>
              </svg>
            </span>
            <span className="whitespace-nowrap">Sign in with Facebook</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="close-button bg-zinc-900 hover:cursor-pointer text-zinc-200"
        >
          <XMarkIcon className="h-9 w-9 text-zinc-900" />
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
