import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { cn } from "@/lib/utils";

interface BackToListBtnProps {
  navPath: string;
  label?: string;
  className?: string;
}
const BackToListBtn: React.FC<BackToListBtnProps> = ({
  navPath,
  label,
  className,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { isDark, isRTL } = useThemeClasses();

  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <button
      onClick={() => navigate(navPath)}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm cursor-pointer font-medium transition-colors duration-200",
        isDark
          ? "text-gray-400 hover:text-teal-400"
          : "text-gray-500 hover:text-teal-600",
        className,
      )}
    >
      <Arrow className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
      <span className="hidden md:inline">
        {label ? label : t("back_to_list")}
      </span>
    </button>
  );
};

export default BackToListBtn;
