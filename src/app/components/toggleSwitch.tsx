import React from "react";

type ToggleSwitchProps = {
  isDarkMode: boolean;
  onToggle: () => void;
};

const ToggleSwitch = ({ isDarkMode, onToggle }: ToggleSwitchProps) => {
  return (
    <button onClick={onToggle} className="toggle-theme-btn">
      {isDarkMode ? "🌞" : "🌜"}
      <style jsx>{`
        .toggle-theme-btn {
          background-color: transparent;
          border: none;
          cursor: pointer;
          font-size: 24px;
        }
      `}</style>
    </button>
  );
};

export default ToggleSwitch;
