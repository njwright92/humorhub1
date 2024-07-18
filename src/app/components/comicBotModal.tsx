import React, { FC } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ComicBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComicBotModal: FC<ComicBotModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Return null if the modal is not open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div
        className="bg-zinc-100 text-orange-500 rounded-lg shadow-lg p-6 max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent click event from propagating
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6 text-zinc-900 cursor-pointer" />
        </button>
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-lg font-bold mb-4">ComicBot Coming Soon!</h2>
          <p className="mb-4 text-center">
            Sorry, ComicBot the funniest chatbot online is not live yet, but its
            coming soon! Check back for a humorous conversation!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComicBotModal;
