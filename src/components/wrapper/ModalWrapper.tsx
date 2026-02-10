import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";
import { X } from "lucide-react";
import { Spinner } from "../shared";
import { useEffect } from "react";

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
  showSpinner?: boolean;
  maxWidth?: string;
  height?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  onClose,
  children,
  showSpinner = false,
  height = "h-[90vh]",
  maxWidth = "max-w-5xl",
}) => {
  const { cardClasses, isRTL } = useThemeClasses();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={clsx(
          height,
          maxWidth,
          cardClasses,
          isRTL ? "rtl" : "ltr",
          "w-full flex flex-col relative rounded-2xl",
        )}
      >
        <button
          onClick={onClose}
          className={clsx(
            cardClasses,
            isRTL ? "-left-9" : "-right-9",
            "p-2 absolute -top-8  text-red-500 cursor-pointer  rounded-full transition-colors ",
          )}
        >
          <X className={`w-6 h-6`} />
        </button>
        <Spinner isLoading={showSpinner} />
        <>{children}</>
      </div>
    </div>
  );
};

export default ModalWrapper;
