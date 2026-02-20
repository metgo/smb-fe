import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { setLanguage } from "@/features/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { useTranslation } from "react-i18next";
import { useCommon } from "@/hooks/useCommon";

export const LanguageSelector = () => {
  const [showLanguages, setShowLanguages] = useState(false);
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation("common");
  const { languages } = useCommon();
  const { language } = useAppSelector((state) => state.settings);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lng: Language) => {
    dispatch(setLanguage(lng));
    i18n.changeLanguage(lng);
    setShowLanguages(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguages(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative top-4 left-4 z-50">
      {/* Globe Button */}
      <button
        onClick={() => setShowLanguages((prev) => !prev)}
        className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
      >
        <Globe className="w-6 h-6 text-white" />
      </button>

      {/* Language Dropdown */}
      {showLanguages && (
        <div
          ref={dropdownRef}
          className="absolute mt-2 w-52 bg-white rounded-md shadow-lg border border-gray-200 z-50"
        >
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value as Language)}
              className={`w-full text-left px-4 py-2 transition-colors rounded-md ${
                language === lang.value
                  ? "bg-gray-300 text-gray-900 font-semibold"
                  : "hover:bg-gray-100 focus:bg-gray-200"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
