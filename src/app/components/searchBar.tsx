import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";

export interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchTerm);
    setSearchTerm("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setIsFocused(true);
  };

  const handleToggleInput = () => {
    setInputVisible(!isInputVisible);
    setIsFocused(true);
  };

  useEffect(() => {
    if (isFocused && isInputVisible) {
      const input = document.getElementById("search-input");
      input?.focus();
    }
  }, [isFocused, isInputVisible]);

  return (
    <div className="relative" id="searchBar">
      <button
        onClick={handleToggleInput}
        className={`${
          isInputVisible ? "hidden" : "flex"
        } items-center justify-center p-2 bg-white text-black rounded-full z-10`}
        aria-label="Toggle search"
      >
        <MagnifyingGlassIcon className="h-8 w-8" />
      </button>

      {isInputVisible && (
        <form
          onSubmit={handleSearch}
          className={`flex items-center rounded-lg bg-white shadow-lg z-10 ${
            isInputVisible ? "animate-slide-in" : "animate-slide-out"
          }`}
        >
          <input
            id="search-input"
            type="text"
            placeholder="Search city to view events.."
            value={searchTerm}
            onChange={handleInputChange}
            className="p-2 text-black rounded-lg shadow-lg w-3/4"
            autoFocus
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              className="px-2 py-2 text-black rounded-lg shadow-lg ml-2 bg-gray-300"
              onClick={handleClearInput}
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-black rounded-lg shadow-lg ml-2 bg-gray-300"
          >
            Search
          </button>
        </form>
      )}
    </div>
  );
}
