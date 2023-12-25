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
    <div className="relative">
      <button
        onClick={() => setInputVisible(!isInputVisible)}
        className="px-2 py-1 bg-white text-black rounded-full"
        aria-label="Toggle search"
      >
        <MagnifyingGlassIcon className="h-7 w-7" />
      </button>

      {isInputVisible && (
        <form
          onSubmit={handleSearch}
          className="absolute top-full mt-1 left-0 flex flex-col sm:flex-row items-center w-full"
        >
          <input
            type="text"
            placeholder="Search city to view events.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-2 py-1 rounded text-black w-64"
          />
          <button
            type="submit"
            className="mt-1 sm:mt-0 sm:ml-1 px-2 py-1 bg-white text-black rounded"
          >
            Search
          </button>
        </form>
      )}
    </div>
  );
}
