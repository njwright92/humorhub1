"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import hh from "../../app/logo.webp";
import { useToast } from "./ToastContext";

const SearchBar = dynamic(() => import("./searchBar"));
const AuthModal = dynamic(() => import("./authModal"));

type NavItem = {
  href?: string;
  label: string;
  icon: string;
  protected?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/mic-finder",
    label: "Mic Finder",
    icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z|circle:12,10,3",
  },
  {
    label: "News",
    icon: "M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9h4|M10 6h8M10 10h8M10 14h4",
    protected: "/news",
  },
  {
    label: "Profile",
    icon: "M20 21a8 8 0 0 0-16 0|circle:12,8,4",
    protected: "/profile",
  },
  {
    href: "/contact",
    label: "Contact Us",
    icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z|m22 6-10 7L2 6",
  },
  {
    href: "/about",
    label: "About",
    icon: "circle:12,12,10|M12 16v-4M12 8h.01",
  },
];

function NavIcon({ icon }: { icon: string }) {
  const parts = icon.split("|");
  return (
    <svg
      className="size-10 text-stone-900 transition-colors group-hover:text-zinc-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {parts.map((part, i) => {
        if (part.startsWith("circle:")) {
          const [cx, cy, r] = part.slice(7).split(",");
          return <circle key={i} cx={cx} cy={cy} r={r} />;
        }
        return <path key={i} d={part} />;
      })}
    </svg>
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
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { getAuth } = await import("../../../firebase.config");
      const { onAuthStateChanged } = await import("firebase/auth");
      const auth = await getAuth();
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (mounted) setIsUserSignedIn(!!user);
      });
    };

    if ("requestIdleCallback" in window) {
      requestIdleCallback(initAuth);
    } else {
      setTimeout(initAuth, 100);
    }

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

  const navItemClass =
    "group relative cursor-pointer transition hover:scale-110 hover:rotate-3";
  const tooltipClass =
    "pointer-events-none absolute left-16 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-stone-800 px-2 py-1 text-sm font-bold text-amber-700 opacity-0 shadow-lg transition-opacity group-hover:opacity-100";

  return (
    <nav className="fixed inset-y-0 left-0 z-50 hidden w-20 flex-col items-center justify-between bg-amber-700 p-2 shadow-lg sm:flex">
      <div className="mt-4 flex flex-col items-center gap-6 text-stone-900">
        <Link href="/" aria-label="Home" className={navItemClass}>
          <Image
            src={hh}
            alt=""
            width={80}
            height={80}
            className="rounded-full shadow-lg"
            priority
          />
        </Link>

        <SearchBar
          isUserSignedIn={isUserSignedIn}
          setIsAuthModalOpen={setIsAuthModalOpen}
        />

        {NAV_ITEMS.map(({ href, label, icon, protected: protectedPath }) => {
          const content = (
            <>
              <NavIcon icon={icon} />
              <span className={tooltipClass}>{label}</span>
            </>
          );

          return protectedPath ? (
            <button
              key={label}
              type="button"
              onClick={() => handleProtectedRoute(protectedPath, label)}
              aria-label={label}
              className={navItemClass}
            >
              {content}
            </button>
          ) : (
            <Link
              key={label}
              href={href!}
              aria-label={label}
              className={navItemClass}
            >
              {content}
            </Link>
          );
        })}
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
