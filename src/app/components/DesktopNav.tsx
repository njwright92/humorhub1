"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import hh from "../../app/hh.webp";
import { useToast } from "./ToastContext";
import MicFinderIcon from "../icons/MicFinderIcon";
import NewsIcon from "../icons/NewsIcon";
import ContactIcon from "../icons/ContactIcon";
import AboutIcon from "../icons/AboutIcon";
import UserIconComponent from "../icons/UserIconComponent";

const SearchBar = dynamic(() => import("./searchBar"), {
  loading: () => <div className="size-10 animate-pulse rounded-full" />,
});

const AuthModal = dynamic(() => import("./authModal"));

const tooltipClass =
  "pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-stone-800 px-2 py-1 text-sm font-bold text-amber-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100";

interface NavLinkProps {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, label, icon, onClick }: NavLinkProps) {
  const className =
    "group relative cursor-pointer transition-transform hover:scale-110 hover:text-stone-700";
  const content = (
    <>
      {icon}
      <span className={tooltipClass}>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {content}
    </button>
  );
}

export default function DesktopNav() {
  const { showToast } = useToast();
  const router = useRouter();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserSignedIn, setIsUserSignedIn] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: undefined | (() => void);

    const initAuth = async () => {
      const { getAuth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");

      const auth = await getAuth();

      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (mounted) setIsUserSignedIn(!!user);
      });
    };

    if ("requestIdleCallback" in window) requestIdleCallback(initAuth);
    else setTimeout(initAuth, 100);

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (isUserSignedIn && pendingRedirect) {
      router.push(pendingRedirect);
      setPendingRedirect(null);
      setIsAuthModalOpen(false);
    }
  }, [isUserSignedIn, pendingRedirect, router]);

  const handleProtectedRoute = useCallback(
    (path: string, label: string) => {
      if (isUserSignedIn) {
        router.push(path);
        return;
      }

      showToast(`Please sign in to view ${label}`, "info");
      setPendingRedirect(path);
      setIsAuthModalOpen(true);
    },
    [isUserSignedIn, router, showToast]
  );

  return (
    <nav className="fixed inset-y-0 left-0 z-50 hidden w-20 flex-col items-center justify-between bg-amber-700 p-2 shadow-lg sm:flex">
      <div className="mt-4 flex flex-col items-center space-y-6 text-stone-900">
        <Link
          href="/"
          aria-label="Home"
          className="group relative transition-transform hover:scale-110"
        >
          <Image
            src={hh}
            alt="Humor Hub Logo"
            width={80}
            height={80}
            className="rounded-full border-2 border-stone-900 shadow-lg"
            priority
          />
          <span className={tooltipClass}>Home</span>
        </Link>

        <SearchBar
          isUserSignedIn={isUserSignedIn}
          setIsAuthModalOpen={setIsAuthModalOpen}
        />

        <NavLink
          href="/MicFinder"
          label="Mic Finder"
          icon={<MicFinderIcon />}
        />

        <NavLink
          label="News"
          icon={<NewsIcon />}
          onClick={() => handleProtectedRoute("/News", "News")}
        />

        <NavLink
          label="Profile"
          icon={<UserIconComponent />}
          onClick={() => handleProtectedRoute("/Profile", "Profile")}
        />

        <NavLink href="/contact" label="Contact Us" icon={<ContactIcon />} />
        <NavLink href="/about" label="About" icon={<AboutIcon />} />
      </div>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={() => setIsUserSignedIn(true)}
        />
      )}
    </nav>
  );
}
