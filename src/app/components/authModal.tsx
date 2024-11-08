"use client";

import React, { useState, useCallback } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  AuthError,
} from "firebase/auth";
import { XMarkIcon } from "@heroicons/react/24/solid";

// Type for the modal props
type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Email and password validation regex patterns
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
    signInWithRedirect(auth, provider);
  };

  if (!isOpen) return null;

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
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="toggle-button hover:underline text-blue-500"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </button>
        <button onClick={handleGoogleSignIn} className="google-signin-button">
          Sign in with Google
        </button>
        <button
          onClick={onClose}
          className="close-button bg-zinc-900 hover:cursor-pointer text-white"
        >
          <XMarkIcon className="h-9 w-9 text-zinc-900" />
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
