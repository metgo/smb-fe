import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Spinner } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface ModalWrapperProps {
  children: React.ReactNode;
  onClose: () => void;
  showSpinner?: boolean;
  maxWidth?: string;
  height?: string;
  closeOnOutsideClick?: boolean;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  onClose,
  children,
  showSpinner = false,
  height = "h-[80dvh] md:h-[90vh]",
  maxWidth = "max-w-5xl",
  closeOnOutsideClick = false,
}) => {
  const { cardClasses, isRTL } = useThemeClasses();
  const [mounted, setMounted] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);

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

  // Touch handlers are scoped to the handle pill only — content scroll is unaffected
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-100 flex items-end md:items-center justify-center md:p-4"
      onClick={closeOnOutsideClick ? handleClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ transform: `translateY(${dragY}px)` }}
        className={clsx(
          height,
          maxWidth,
          cardClasses,
          isRTL ? "rtl" : "ltr",
          "w-full flex flex-col relative rounded-t-2xl md:rounded-2xl",
          !isDragging && "transition-transform duration-300 ease-out",
          mounted ? "translate-y-0" : "translate-y-full md:translate-y-0",
        )}
      >
        {/* Drag handle — mobile only; drag down to dismiss, tap to close */}
        <button
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleClose}
          className="flex justify-center pt-2.5 pb-1 md:hidden shrink-0 w-full touch-none"
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
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;
