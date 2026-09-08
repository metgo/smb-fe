import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Info, Search } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ChatWindowHeaderProps {
  conversation?: any;
  groupMemberCount?: number;
  onBack: () => void;
  presenceLabel: string | null;
  isDmOnline: boolean;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  setShowGroupInfoModal: (show: boolean) => void;
}

export const ChatWindowHeader: React.FC<ChatWindowHeaderProps> = ({
  conversation,
  groupMemberCount,
  onBack,
  presenceLabel,
  isDmOnline,
  showSearch,
  setShowSearch,
  setShowGroupInfoModal,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
  } = useThemeClasses();

  return (
    <div
      className={clsx(
        "px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between z-10 shrink-0 shadow-sm",
        borderColor,
        bgPrimary,
      )}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onBack}
          className={clsx(
            "md:hidden rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95",
            hoverBg,
          )}
        >
          <ArrowLeft className={clsx(textSecondary)} />
        </button>
        <div className="min-w-0">
          <h3
            className={clsx(
              "text-sm md:text-base font-bold truncate",
              textPrimary,
            )}
          >
            {conversation?.name}
          </h3>
          {conversation?.type !== "dm" ? (
            <p className={clsx("text-[10px] hidden md:block", textTertiary)}>
              {t("members_count", {
                count: groupMemberCount ?? conversation?.members.length ?? 0,
              })}{" "}
              &bull; {conversation?.description}
            </p>
          ) : (
            presenceLabel && (
              <p
                className={clsx(
                  "text-[10px]",
                  isDmOnline
                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                    : textTertiary,
                )}
              >
                {presenceLabel}
              </p>
            )
          )}
        </div>
      </div>

      {/* Header Tools */}
      <div className="flex items-center gap-2">
        {conversation?.type === "group" && (
          <button
            onClick={() => setShowGroupInfoModal(true)}
            className={clsx(
              "p-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
              hoverBg,
              textTertiary,
            )}
            title={t("group_info")}
          >
            <Info className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className={clsx(
            "p-2.5 rounded-xl transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95",
            showSearch
              ? isDark
                ? "bg-teal-950/30 text-teal-400 shadow-md shadow-teal-500/25"
                : "bg-teal-50 text-teal-700 shadow-md shadow-teal-500/25"
              : clsx(hoverBg, textTertiary),
          )}
          title={t("search_inside_chat")}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
