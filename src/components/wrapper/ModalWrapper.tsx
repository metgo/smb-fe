import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

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
  height = "h-[80dvh] md:h-[90vh]",
  maxWidth = "max-w-5xl",
}) => {
  const { cardClasses, isRTL } = useThemeClasses();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-100 flex items-end md:items-center justify-center md:p-4"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          height,
          maxWidth,
          cardClasses,
          isRTL ? "rtl" : "ltr",
          "w-full flex flex-col relative rounded-t-2xl md:rounded-2xl",
          "transition-transform duration-300 ease-out",
          mounted ? "translate-y-0" : "translate-y-full md:translate-y-0",
        )}
      >
        {/* Collapse handle — mobile only, tapping closes the sheet */}
        <button
          onClick={handleClose}
          className="flex justify-center pt-2.5 pb-1 md:hidden shrink-0 w-full"
          aria-label="Close"
        >
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </button>

        <button
          onClick={handleClose}
          className={clsx(
            cardClasses,
            isRTL ? "-left-4" : "-right-4",
            "p-1.5 absolute -top-4 text-red-500 cursor-pointer rounded-full transition-colors z-10 hidden md:flex",
          )}
        >
          <X className="w-5 h-5" />
        </button>
        <Spinner isLoading={showSpinner} />
        <>{children}</>
      </div>
    </div>
  );
};

export default ModalWrapper;
