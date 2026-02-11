import clsx from "clsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface BackToListBtnProps {
  navPath: string;
}
const BackToListBtn: React.FC<BackToListBtnProps> = ({ navPath }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { isDark, isRTL } = useThemeClasses();

  return (
    <button
      onClick={() => navigate(navPath)}
      className={clsx(
        "flex items-center gap-2 text-sm hover:text-teal-600 transition-colors",
        isDark ? "text-gray-300" : "text-gray-700",
      )}
    >
      {isRTL ? (
        <>
          <ArrowRight className="w-5 h-5" />
          {t("back_to_list")}
        </>
      ) : (
        <>
          <ArrowLeft className="w-5 h-5" />
          {t("back_to_list")}
        </>
      )}
    </button>
  );
};

export default BackToListBtn;
