import { FC } from "react";

interface ComicBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComicBotModal: FC<ComicBotModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Return null if the modal is not open

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div
        className="bg-zinc-200 text-green-900 rounded-lg shadow-lg p-4 max-w-md relative"
        onClick={(e) => e.stopPropagation()} // Prevent click event from propagating
      >
        <button onClick={onClose} className="close-button cursor-pointer">
          <svg
            className="fill-current h-8 w-8 text-zinc-900"
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 5.652a.5.5 0 010 .707L10.707 10l3.641 3.641a.5.5 0 11-.707.707L10 10.707l-3.641 3.641a.5.5 0 11-.707-.707L9.293 10 5.652 6.359a.5.5 0 01.707-.707L10 9.293l3.641-3.641a.5.5 0 01.707 0z" />
          </svg>
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
