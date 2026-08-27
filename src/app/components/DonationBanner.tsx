"use client";

import { useEffect, useState } from "react";
import CloseIcon from "./CloseIcon";

const DISMISSAL_KEY = "humorhub-donation-banner-dismissed";
const donationUrl = process.env.NEXT_PUBLIC_PAYPAL_DONATE_URL;

function isSafeDonationUrl(url: string | undefined): url is string {
  if (!url) return false;

  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export default function DonationBanner() {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    setIsDismissed(window.localStorage.getItem(DISMISSAL_KEY) === "true");
  }, []);

  if (!isSafeDonationUrl(donationUrl) || isDismissed) return null;

  const dismiss = () => {
    window.localStorage.setItem(DISMISSAL_KEY, "true");
    setIsDismissed(true);
  };

  return (
    <div className="h-14 sm:h-0">
      <aside
        aria-label="Support Humor Hub"
        className="fixed inset-x-2 top-16 z-30 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-lg border border-amber-700 bg-zinc-200 px-3 py-2 text-stone-900 shadow-lg sm:left-24 sm:right-4 sm:top-4 sm:mx-0"
      >
        <a
          href={donationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 font-bold underline decoration-amber-700 decoration-2 underline-offset-2 transition-colors hover:text-amber-800 focus-visible:rounded-sm"
        >
          Support Humor Hub
          <span className="sr-only"> (opens PayPal in a new tab)</span>
        </a>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss support banner"
          className="grid size-8 shrink-0 place-items-center rounded-full text-stone-900 transition-colors hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          <CloseIcon className="size-5" />
        </button>
      </aside>
    </div>
  );
}
