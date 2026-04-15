import { useTranslation } from "react-i18next";
import { Save, Loader } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DraftButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

const DraftButton: React.FC<DraftButtonProps> = ({ isLoading, onClick }) => {
  const { t } = useTranslation("common");
  const { isDark } = useThemeClasses();
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
        isDark
          ? "border-gray-700 hover:bg-gray-800 text-gray-300"
          : "border-gray-300 hover:bg-gray-100"
      }`}
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          {t("saving")}
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          {t("save_draft")}
        </>
      )}
    </button>
  );
};

export default DraftButton;
