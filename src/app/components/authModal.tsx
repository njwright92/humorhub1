import React, { useEffect, useState, useCallback } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  AuthError,
} from "firebase/auth";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { XMarkIcon } from "@heroicons/react/16/solid";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
const passwordRegex = /^.{6,}$/;
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [ui, setUi] = useState<firebaseui.auth.AuthUI | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(true);

  const handleAuth = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const auth = getAuth();

      if (!emailRegex.test(email)) {
        alert(
          "Oops! That doesn't look like a valid email address. Please try again."
        );
        return;
      }

      if (!passwordRegex.test(password)) {
        alert(
          "Your password needs to be at least 6 characters long. Please try again."
        );
        return;
      }

      if (isSignUp && password !== confirmPassword) {
        alert(
          "The passwords you entered don't match. Please check and try again."
        );
        return;
      }

      try {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email, password);
          alert(
            "Welcome aboard! You've successfully signed up. Please update your profile."
          );
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          alert("Welcome back! You've successfully signed in.");
        }
        onClose();
      } catch (error) {
        if (error instanceof Error) {
          switch ((error as AuthError).code) {
            case "auth/email-already-in-use":
              alert(
                "This email is already in use. Try signing in or use a different email."
              );
              break;
            case "auth/wrong-password":
              alert("The password you entered is incorrect. Please try again.");
              break;
            default:
              alert(
                `Something went wrong: ${error.message}. Please try again later.`
              );
          }
        }
      }
    },
    [email, password, confirmPassword, isSignUp, onClose]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) {
      return;
    }

    import("firebaseui").then((firebaseUiModule) => {
      const authInstance = getAuth();
      let uiInstance = firebaseUiModule.auth.AuthUI.getInstance();

      if (!uiInstance) {
        uiInstance = new firebaseUiModule.auth.AuthUI(authInstance);
      }
      setUi(uiInstance);

      const uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: () => {
            onClose();
            return true;
          },
          uiShown: () => {
            const loader = document.getElementById("loader");
            if (loader) {
              loader.style.display = "none";
            }
          },
        },
        signInFlow: "popup",
        signInSuccessUrl: "/",
        signInOptions: [GoogleAuthProvider.PROVIDER_ID],
        tosUrl: "https://thehumorhub.com/userAgreement",
        privacyPolicyUrl: "https://thehumorhub.com/privacyPolicy",
      };

      uiInstance.start("#firebaseui-auth-container", uiConfig);
    });

    return () => {
      if (ui) {
        ui.delete();
      }
    };
  }, [isOpen, onClose, ui]);

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
            className="input-field "
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
        <div id="firebaseui-auth-container"></div>
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
