import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ChatSearchBarProps {
  localSearchQuery: string;
  setLocalSearchQuery: (query: string) => void;
  localSearchResults: string[];
  currentSearchIndex: number;
  handleSearchNext: (dir: "prev" | "next") => void;
  onClose: () => void;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
  localSearchQuery,
  setLocalSearchQuery,
  localSearchResults,
  currentSearchIndex,
  handleSearchNext,
  onClose,
}) => {
  const { t } = useTranslation("chat");
  const { bgPrimary, textTertiary, borderColor, hoverBg, inputClasses } =
    useThemeClasses();

  return (
    <div
      className={clsx(
        "px-4 py-3 border-b flex items-center gap-3 z-10 shrink-0",
        borderColor,
        bgPrimary,
      )}
    >
      <Search className={clsx("w-4 h-4", textTertiary)} />
      <input
        type="text"
        placeholder={t("search_keywords_inside_conversation")}
        value={localSearchQuery}
        onChange={(e) => setLocalSearchQuery(e.target.value)}
        className={clsx(
          "flex-1 px-4 py-2 text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 transition-all duration-200",
          inputClasses,
        )}
      />
      {localSearchResults.length > 0 && (
        <div
          className={clsx(
            "flex items-center gap-2 text-xs shrink-0",
            textTertiary,
          )}
        >
          <span className="font-medium">
            {t("search_result_count", {
              current: currentSearchIndex + 1,
              total: localSearchResults.length,
            })}
          </span>
          <button
            onClick={() => handleSearchNext("prev")}
            className={clsx(
              "p-2 rounded-xl border text-[10px] font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              borderColor,
              hoverBg,
            )}
          >
            ▲
          </button>
          <button
            onClick={() => handleSearchNext("next")}
            className={clsx(
              "p-2 rounded-xl border text-[10px] font-bold cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
              borderColor,
              hoverBg,
            )}
          >
            ▼
          </button>
        </div>
      )}
      <button
        onClick={onClose}
        className={clsx(
          "text-xs font-bold shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 px-3 py-2",
          textTertiary,
        )}
      >
        {t("cancel")}
      </button>
    </div>
  );
};
