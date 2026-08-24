import { ArrowLeft, ArrowRight } from "lucide-react";
// import { useTranslation } from "react-i18next";
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
  className,
}) => {
  const navigate = useNavigate();
  // const { t } = useTranslation("common");
  const { isRTL } = useThemeClasses();

  const Arrow = isRTL ? ArrowRight : ArrowLeft;

  return (
    <button
      onClick={() => navigate(navPath)}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm cursor-pointer font-medium transition-colors duration-200 rounded px-2 py-1",
        "text-white bg-green-500/40 hover:bg-green-500/60",
        className,
      )}
    >
      <Arrow className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5  rtl:group-hover:translate-x-0.5" />
      {/* <span className="hidden md:inline">
        {label ? label : t("back_to_list")}
      </span> */}
    </button>
  );
};

export default BackToListBtn;
