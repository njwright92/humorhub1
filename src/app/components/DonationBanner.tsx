"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import CloseIcon from "./CloseIcon";

const QR_CODE_PATH = "/support-qr-code.jpeg";

export default function DonationBanner() {
  const pathname = usePathname();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);

  useEffect(() => {
    setIsDismissed(false);
  }, [pathname]);

  useEffect(() => {
    if (!isQrCodeOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsQrCodeOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isQrCodeOpen]);

  if (isDismissed) return null;

  return (
    <div className="h-14 sm:h-0">
      <aside
        aria-label="Support Humor Hub"
        className="fixed inset-x-2 top-16 z-30 mx-auto grid max-w-xl grid-cols-[2rem_minmax(0,1fr)_2rem] items-center rounded-2xl border border-amber-700 bg-zinc-200 px-2 py-1 text-stone-900 shadow-xl sm:top-4 sm:right-4 sm:left-24 sm:mx-0"
      >
        <span aria-hidden="true" />
        <button
          type="button"
          onClick={() => setIsQrCodeOpen(true)}
          className="grid min-w-0 place-items-center gap-0.5 rounded-md px-2 py-1 text-center transition-colors hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          <p className="mb-1 text-xs leading-tight">
            Help people find and perform comedy anywhere!
          </p>
          <span className="text-lg font-extrabold text-amber-700 underline">
            Support Comedy & Donate Now!
          </span>
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss support banner"
          className="col-start-3 grid size-8 place-items-center justify-self-end rounded-full text-stone-900 transition-colors hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          <CloseIcon className="size-5" />
        </button>
      </aside>

      {isQrCodeOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsQrCodeOpen(false);
          }}
          className="fixed inset-0 z-50 grid place-items-center bg-stone-900/70 p-4"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-qr-title"
            className="relative grid w-full max-w-sm justify-items-center gap-4 rounded-xl border border-amber-700 bg-zinc-200 p-6 text-center text-stone-900 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setIsQrCodeOpen(false)}
              aria-label="Close support QR code"
              className="absolute top-3 right-3 grid size-8 place-items-center rounded-full transition-colors hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              <CloseIcon className="size-5" />
            </button>
            <h2 id="support-qr-title" className="text-2xl text-amber-700">
              Keep Comedy Connected 🎤
            </h2>
            <p className="max-w-xs leading-snug">
              Scan to donate and help people find a stage, perform, and connect
              with comedy anywhere. Live local. Think global.
            </p>
            <Image
              src={QR_CODE_PATH}
              alt="QR code to support Humor Hub"
              width={512}
              height={512}
              className="h-auto w-full max-w-64 border border-stone-400 bg-zinc-200 p-2"
            />
          </section>
        </div>
      )}
    </div>
  );
}
