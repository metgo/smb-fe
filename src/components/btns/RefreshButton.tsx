import clsx from "clsx";
import { RefreshCwIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  isRefreshing = false,
}) => {
  const { t } = useTranslation("common");
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 cursor-pointer border border-blue-500 rounded-lg px-4 py-1.5 text-blue-500 hover:bg-blue-100 transition duration-200"
    >
      <RefreshCwIcon
        size={16}
        className={clsx(isRefreshing ? "animate-spin" : "")}
      />
      <span>{t("refresh")}</span>
    </button>
  );
};

export default RefreshButton;
