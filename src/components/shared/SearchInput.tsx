import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface SearchInputProps {
  placeholder: string;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  // Remove theme and isRTL props to rely on global state for consistency
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  searchTerm,
  setSearchTerm,
}) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const { isDark, rowDir } = useThemeClasses(); // rowDir includes RTL info

  const isRTL = rowDir === "flex-row-reverse";

  useEffect(() => {
    setInputValue(searchTerm); // Sync if external searchTerm changes
  }, [searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(inputValue);
    }, 3000); // 3 seconds debounce

    return () => {
      clearTimeout(handler);
    };
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
          onClick={() => setInputValue("")}
          size={20}
        />
      )}
    </div>
  );
};

export default SearchInput;
