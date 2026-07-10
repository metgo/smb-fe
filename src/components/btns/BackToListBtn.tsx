import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface BackToListBtnProps {
  navPath: string;
  label?: string;
}
const BackToListBtn: React.FC<BackToListBtnProps> = ({ navPath, label }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { isDark, isRTL } = useThemeClasses();

  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <button
      onClick={() => navigate(navPath)}
      className={clsx(
        "group inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200",
        "rounded-lg md:px-3 md:py-1.5",
        isDark
          ? "text-gray-400 hover:text-teal-400 md:hover:bg-white/5"
          : "text-gray-500 hover:text-teal-600 md:hover:bg-gray-100",
      )}
    >
      <Arrow className="w- h-4 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
      <span className="hidden md:inline">
        {label ? label : t("back_to_list")}
      </span>
    </button>
  );
};

export default BackToListBtn;
