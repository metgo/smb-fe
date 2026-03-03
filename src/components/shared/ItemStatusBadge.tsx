import { useThemeClasses } from "@/hooks/useThemeClasses";
import { useTranslation } from "react-i18next";

interface ItemStatusBadgeProps {
  status: TStatus;
}

const ItemStatusBadge = ({ status }: ItemStatusBadgeProps) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  const badges = {
    draft: isDark ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700",

    pending: isDark
      ? "bg-yellow-900/30 text-yellow-100"
      : "bg-yellow-100 text-yellow-700",

    approved: isDark
      ? "bg-green-900/30 text-green-100"
      : "bg-green-100 text-green-700",

    rejected: isDark ? "bg-red-900/30 text-red-100" : "bg-red-100 text-red-700",

    archived: isDark
      ? "bg-zinc-800 text-zinc-100"
      : "bg-zinc-100 text-zinc-600",

    closed: isDark ? "bg-red-900/30 text-red-100" : "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status]}`}
    >
      {t(status)}
    </span>
  );
};

export default ItemStatusBadge;
