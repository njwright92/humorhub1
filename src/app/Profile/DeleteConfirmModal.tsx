"use client";
import { useEffect } from "react";

export default function DeleteConfirmModal({
  eventName,
  onClose,
  onConfirm,
}: {
  eventName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="card-base w-full max-w-sm border-stone-700 bg-stone-900 p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-6 text-lg font-semibold text-zinc-200">
          Remove "{eventName}" from your list?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-stone-600 py-2 text-sm text-stone-400 hover:text-white"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-700 py-2 text-sm font-bold text-white hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
