import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const StatusPill = ({ status }: { status: string }) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();

  const st = status.toLowerCase();

  let colorClass: string;
  switch (st) {
    case "approved":
      colorClass = "bg-green-500/20 text-green-500";
      break;
    case "pending":
      colorClass = "bg-yellow-500/20 text-yellow-500";
      break;
    case "rejected":
      colorClass = "bg-red-500/20 text-red-500";
      break;
    case "closed":
      colorClass = "bg-red-600/20 text-red-600";
      break;
    case "archived":
      colorClass = "bg-orange-400/20 text-orange-400";
      break;
    case "draft":
      colorClass = "bg-gray-400/20 text-gray-400";
      break;
    default:
      colorClass = isDark
        ? "bg-gray-700 text-gray-400"
        : "bg-gray-100 text-gray-600";
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium",
        colorClass,
      )}
    >
      {t(st) || st || t("unknown")}
    </span>
  );
};

export default StatusPill;
