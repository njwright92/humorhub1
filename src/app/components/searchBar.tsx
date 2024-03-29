import React, { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(searchTerm);
    setSearchTerm("");
  };

  return (
    <div className="relative" id="search-bar">
      <button
        onClick={() => setInputVisible(!isInputVisible)}
        className={`${
          isInputVisible ? "hidden" : "flex"
        } items-center justify-center p-2 bg-white text-black rounded-full z-10`}
        aria-label="Toggle search"
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>

      {isInputVisible && (
        <form
          onSubmit={handleSearch}
          className="flex items-center rounded-lg bg-white shadow-lg z-10  "
        >
          <input
            type="text"
            placeholder="Search city to view events.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 text-black rounded-lg shadow-lg w-3/4"
            autoFocus
          />
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
