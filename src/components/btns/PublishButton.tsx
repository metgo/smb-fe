import { useTranslation } from "react-i18next";
import { CheckCircle, Loader } from "lucide-react";

interface PublishButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

const PublishButton: React.FC<PublishButtonProps> = ({
  isLoading,
  onClick,
}) => {
  const { t } = useTranslation("common");
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="px-4 md:px-6 py-2 rounded md:rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 cursor-pointer"
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span className="hidden md:block">{t("publishing")}</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          <span className="hidden md:block">{t("publish")}</span>
        </>
      )}
    </button>
  );
};

export default PublishButton;
