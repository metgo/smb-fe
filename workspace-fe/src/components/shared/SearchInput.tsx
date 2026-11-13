import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface SearchInputProps {
  placeholder: string;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  storageKey?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  searchTerm,
  setSearchTerm,
}) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const { isDark, rowDir } = useThemeClasses();
  const isRTL = rowDir === "flex-row-reverse";
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPushedRef = useRef(searchTerm);

  // Sync from parent only when the input is NOT focused and the change is
  // external (e.g. clearFilter, or a saved search loaded on mount). Skipping
  // the sync while the user is actively typing prevents the parent's async
  // state update from clobbering keystrokes mid-type — the root cause of
  // characters disappearing on slow devices / browsers.
  useEffect(() => {
    const isFocused = document.activeElement === inputRef.current;
    if (!isFocused && searchTerm !== lastPushedRef.current) {
      setInputValue(searchTerm);
      lastPushedRef.current = searchTerm;
    }
  }, [searchTerm]);

  // Debounce: propagate local input up to parent after 300 ms of inactivity.
  useEffect(() => {
    const handler = setTimeout(() => {
      lastPushedRef.current = inputValue;
      setSearchTerm(inputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [inputValue, setSearchTerm]);

  const handleClear = () => {
    lastPushedRef.current = "";
    setInputValue("");
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <Search
        className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none ${
          isDark ? "text-gray-500" : "text-gray-400"
        }`}
      />

      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 rounded-lg border ${
          isDark
            ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
        } focus:outline-none focus:ring-2 focus:ring-teal-500`}
      />

      {inputValue && (
        <X
          className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 cursor-pointer ${
            isDark
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-500 hover:text-black"
          }`}
          onClick={handleClear}
          size={20}
        />
      )}
    </div>
  );
};

export default SearchInput;
