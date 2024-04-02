import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

type ToggleSwitchProps = {
  isDarkMode: boolean;
  onToggle: () => void;
};

const ToggleSwitch = ({ isDarkMode, onToggle }: ToggleSwitchProps) => {
  return (
    <button
      onClick={onToggle}
      className={`toggle-theme-btn ${
        isDarkMode ? "bg-zinc-900 text-zinc-200" : "bg-zinc-200 text-zinc-900"
      }`}
    >
      {isDarkMode ? (
        <SunIcon className="w-6 h-6 rounded-full drop-shadow-sm" />
      ) : (
        <MoonIcon className="w-6 h-6 rounded-full drop-shadow-sm" />
      )}
    </button>
  );
};

export default ToggleSwitch;
