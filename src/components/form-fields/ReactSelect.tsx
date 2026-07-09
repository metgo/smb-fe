import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { ImageWithFallback } from "../shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

export type ItemOption = {
  value: string;
  label: string;
  logo?: string | undefined;
};

type Props = {
  items?: {
    _id: string;
    name: string;
    logo?: string | undefined;
  }[];
  value?: string | null;
  onChange: (value: string) => void;
  onSearch?: (keyword: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  minWidth?: number;
  logoSize?: {
    width: number;
    height: number;
  };
  optionGap?: number;
};

export default function ReactSelect({
  items,
  value,
  onChange,
  minWidth = 260,
  placeholder = "Select website",
  isClearable = false,
  isDisabled = false,
  isLoading = false,
  onSearch,
  logoSize = { width: 40, height: 30 },
  optionGap = 4,
}: Props) {
  const { isDark } = useThemeClasses();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const options: ItemOption[] =
    items?.map((site) => ({
      value: site._id,
      label: site.name,
      logo: site.logo,
    })) || [];

  const selectedOption = options.find((o) => o.value === value) || null;

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (option: ItemOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ minWidth, zIndex: isOpen ? 99999 : 40 }}
    >
      {/* Select Trigger */}
      <div
        className={`
          flex items-center justify-between
          h-11 px-3 py-2
          rounded-lg border
          transition-all duration-200
          cursor-pointer
          ${
            isOpen
              ? isDark
                ? "border-teal-400 shadow-[0_0_0_2px_#2dd4bf]"
                : "border-teal-500 shadow-[0_0_0_2px_#14b8a6]"
              : isDark
                ? "border-gray-600 hover:border-gray-500"
                : "border-gray-300 hover:border-gray-400"
          }
          ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isDark ? "bg-gray-800" : "bg-white"}
        `}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {selectedOption?.logo && (
            <ImageWithFallback
              src={selectedOption.logo}
              alt={selectedOption.label}
              style={{
                width: logoSize.width,
                height: logoSize.height,
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          )}
          <span
            className={`
              truncate font-semibold
              ${selectedOption ? (isDark ? "text-white" : "text-gray-900") : ""}
              ${!selectedOption ? (isDark ? "text-gray-400" : "text-gray-500") : ""}
            `}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isClearable && selectedOption && (
            <button
              onClick={handleClear}
              className={`
                p-0.5 rounded-full
                transition-colors duration-200
                hover:bg-gray-200 dark:hover:bg-gray-600
              `}
              type="button"
            >
              <X
                size={16}
                className={isDark ? "text-gray-400" : "text-gray-500"}
              />
            </button>
          )}
          <ChevronDown
            size={20}
            className={`
              transition-transform duration-200
              ${isOpen ? "rotate-180" : ""}
              ${isDark ? "text-gray-400" : "text-gray-500"}
            `}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div
          className={`
            absolute left-0 right-0 mt-1
            rounded-lg border shadow-lg
            overflow-hidden
            ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
          `}
          style={{ zIndex: 99999 }}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearch?.(e.target.value);
              }}
              className={`
                w-full px-3 py-1.5 text-sm rounded-md border
                focus:outline-none focus:ring-2
                transition-all duration-200
                ${
                  isDark
                    ? "bg-gray-800 border-gray-600 text-white focus:ring-teal-400 focus:border-teal-400"
                    : "bg-white border-gray-300 text-gray-900 focus:ring-teal-500 focus:border-teal-500"
                }
              `}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-60">
            {isLoading ? (
              <div
                className={`
                  px-4 py-3 text-center text-sm
                  ${isDark ? "text-gray-400" : "text-gray-500"}
                `}
              >
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div
                className={`
                  px-4 py-3 text-center text-sm
                  ${isDark ? "text-gray-400" : "text-gray-500"}
                `}
              >
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5
                    transition-colors duration-150
                    cursor-pointer
                    ${
                      option.value === value
                        ? isDark
                          ? "bg-teal-900/50 text-white"
                          : "bg-teal-50 text-gray-900"
                        : isDark
                          ? "hover:bg-gray-800 text-gray-200"
                          : "hover:bg-gray-50 text-gray-900"
                    }
                  `}
                  style={{ gap: optionGap }}
                >
                  {option.logo && (
                    <ImageWithFallback
                      src={option.logo}
                      alt={option.label}
                      style={{
                        width: logoSize.width,
                        height: logoSize.height,
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span className="font-semibold truncate">{option.label}</span>
                  {option.value === value && (
                    <span className="ml-auto text-teal-500">✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
