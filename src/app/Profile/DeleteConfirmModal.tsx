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
      className="fixed inset-0 z-50 grid place-items-center bg-stone-900/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card-dark w-full max-w-sm p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-6 text-lg font-bold">
          Remove "{eventName}" from your list?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-stone-600 py-2 text-sm font-bold opacity-70 hover:opacity-100"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-700 py-2 text-sm font-bold text-white shadow-xl hover:bg-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
