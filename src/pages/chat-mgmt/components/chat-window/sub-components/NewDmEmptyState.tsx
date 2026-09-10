import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Mail, UserCircle } from "lucide-react";

import { useThemeClasses } from "@/hooks/useThemeClasses";
import { getInitials } from "@/helpers";

interface NewDmEmptyStateProps {
  dmUser: any;
  onViewProfile: () => void;
}

export const NewDmEmptyState: React.FC<NewDmEmptyStateProps> = ({
  dmUser,
  onViewProfile,
}) => {
  const { t } = useTranslation("chat");
  const {
    isDark,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
  } = useThemeClasses();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center select-none px-4">
      <div
        className={clsx(
          "w-16 h-16 rounded-full border shrink-0 flex items-center justify-center font-bold text-xl mb-3",
          borderColor,
          isDark ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-600",
        )}
      >
        {getInitials(dmUser.name)}
      </div>
      <h4 className={clsx("text-sm font-bold", textPrimary)}>{dmUser.name}</h4>
      {dmUser.email && (
        <p
          className={clsx(
            "text-xs flex items-center gap-1.5 mt-1",
            textTertiary,
          )}
        >
          <Mail className="w-3.5 h-3.5" />
          {dmUser.email}
        </p>
      )}
      <p className={clsx("text-[11px] mt-2", textTertiary)}>
        {t("no_previous_conversation")}
      </p>
      {dmUser.email && (
        <button
          onClick={onViewProfile}
          className={clsx(
            "mt-4 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all duration-200 hover:scale-105 active:scale-95",
            borderColor,
            textSecondary,
            hoverBg,
          )}
        >
          <UserCircle className="w-4 h-4" />
          {t("view_profile_button")}
        </button>
      )}
    </div>
  );
};
