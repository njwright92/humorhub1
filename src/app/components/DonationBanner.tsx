"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import CloseIcon from "./CloseIcon";

const QR_CODE_PATH = "/support-qr-code.jpeg";

export default function DonationBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isQrCodeOpen, setIsQrCodeOpen] = useState(false);

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
    <>
      <aside
        aria-label="Support Humor Hub"
        className="fixed bottom-4 left-6 z-30 inline-grid w-fit max-w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-1/2 grid-cols-[minmax(0,1fr)_1.5rem] items-center rounded-3xl border border-amber-700 bg-zinc-200 p-1 text-stone-900 shadow-lg sm:right-4 sm:left-auto sm:translate-x-0"
      >
        <button
          type="button"
          onClick={() => setIsQrCodeOpen(true)}
          className="grid min-w-0 place-items-center gap-px rounded-md px-1 py-1 text-center transition-colors hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 sm:px-2"
        >
          <p className="mb-1 text-[0.5rem] leading-tight whitespace-nowrap sm:text-[0.6rem] lg:text-xs">
            Help people find and perform comedy anywhere!
          </p>
          <span className="text-[0.5rem] leading-tight font-bold text-blue-700 underline sm:text-[0.6rem] lg:text-xs">
            Support Comedy Donations!
          </span>
        </button>
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss support banner"
          className="col-start-2 row-start-1 grid size-4 place-items-center self-start justify-self-end rounded-full text-stone-900 transition-colors hover:bg-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          <CloseIcon className="size-3" />
        </button>
      </aside>

      {isQrCodeOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsQrCodeOpen(false);
          }}
          className="fixed inset-0 z-50 grid place-items-center bg-stone-900/70 p-1"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-qr-title"
            className="relative grid w-full max-w-sm justify-items-center gap-4 rounded-xl border border-amber-700 bg-zinc-200 p-2 text-center text-stone-900 shadow-xl"
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
              className="h-auto w-full max-w-64 border border-stone-400 bg-zinc-200 p-1"
            />
          </section>
        </div>
      )}
    </>
  );
}
