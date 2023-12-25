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

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const emailRegex = /\S+@\S+\.\S+/;
const passwordRegex = /.{6,}/;

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
        alert("Please enter a valid email address.");
        return;
      }

      if (!passwordRegex.test(password)) {
        alert("Password must be at least 6 characters.");
        return;
      }

      if (isSignUp && password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      try {
        if (isSignUp) {
          await createUserWithEmailAndPassword(auth, email, password);
          alert("Signed up successfully! Please update your profile.");
        } else {
          await signInWithEmailAndPassword(auth, email, password);
          alert("Signed in successfully!");
        }
        onClose();
      } catch (error) {
        if (error instanceof Error) {
          switch ((error as AuthError).code) {
            case "auth/email-already-in-use":
              alert(
                "Email already in use. Please sign in or use a different email."
              );
              break;
            case "auth/wrong-password":
              alert("Incorrect password. Please try again.");
              break;
            default:
              alert(`Error: ${error.message}`);
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
        tosUrl: "<your-tos-url>",
        privacyPolicyUrl: "<your-privacy-policy-url>",
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
          <label htmlFor="email" className="text-black">
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
          <label htmlFor="password" className="text-black">
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
              <label htmlFor="confirmPassword" className="text-black">
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
          <button type="submit" className="auth-button">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="toggle-button"
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </button>
        <div id="firebaseui-auth-container"></div>
        <button onClick={onClose} className="close-button">
          &times;
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
