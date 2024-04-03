"use client";

import React, { useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

type ToggleSwitchProps = {
  isDarkMode: boolean;
  onToggle: () => void;
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const onToggle = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="flex items-center justify-center p-4">
      <label
        htmlFor="darkModeSwitch"
        className="relative inline-block w-14 h-8 cursor-pointer"
      >
        <input
          type="checkbox"
          id="darkModeSwitch"
          className="sr-only"
          checked={isDarkMode}
          onChange={onToggle}
        />
        <span className="block bg-gray-600 rounded-full h-full w-full"></span>
        <span
          className={`absolute left-0 top-0 bottom-0 m-auto transition-transform transform ${
            isDarkMode ? "translate-x-full" : "translate-x-0"
          } w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md`}
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-800" />
          )}
        </span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
