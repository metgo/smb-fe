import React, { useState, useEffect } from "react";
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
  storageKey = "",
}) => {
  const STORAGE_KEY = storageKey; // localStorage key

  const [inputValue, setInputValue] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem(STORAGE_KEY) ?? searchTerm;
  });
  const { isDark, rowDir } = useThemeClasses();
  const isRTL = rowDir === "flex-row-reverse";

  useEffect(() => {
    setInputValue(localStorage.getItem(STORAGE_KEY) ?? searchTerm); // Sync if external searchTerm changes
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 300); // 3 seconds debounce

    return () => clearTimeout(handler);
  }, [inputValue, setSearchTerm]);

  return (
    <div>
      <Search
        className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 ${
          isDark ? "text-gray-500" : "text-gray-400"
        }`}
      />

      <input
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
          onClick={() => {
            setInputValue("");
            localStorage.removeItem(STORAGE_KEY);
          }}
          size={20}
        />
      )}
    </div>
  );
};

export default SearchInput;
