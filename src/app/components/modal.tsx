import React from "react";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container relative">
        {children}
        <button
          onClick={onClose}
          className="close-modal-button absolute top-0 right-0 text-black text-lg p-2 mt-10 mr-2"
          style={{ cursor: "pointer" }}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
