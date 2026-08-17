import { useTranslation } from "react-i18next";
import { ArrowDown } from "lucide-react";

interface ScrollJumpButtonsProps {
  showScrollBanner: boolean;
  showJumpButton: boolean;
  scrollToBottom: () => void;
}

export const ScrollJumpButtons: React.FC<ScrollJumpButtonsProps> = ({
  showScrollBanner,
  showJumpButton,
  scrollToBottom,
}) => {
  const { t } = useTranslation("chat");

  return (
    <>
      {showScrollBanner && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 cursor-pointer z-10"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          {t("new_message")} &darr;
        </button>
      )}

      {showJumpButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-4 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold p-2 rounded-full shadow-lg cursor-pointer z-10"
          title={t("jump_to_latest")}
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </>
  );
};
