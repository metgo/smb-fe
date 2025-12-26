"use client";

import clsx from "clsx";
import { ReactNode, useEffect } from "react";

import IconImage from "./IconImage";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className: string;
  hideCloseBtn?: boolean;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  className,
  hideCloseBtn = false,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm sm:flex items-start justify-center max-sm:p-0 p-4 z-999"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            className,
            "bg-white relative rounded-xl z-999 mt-22",
          )}
        >
          {!hideCloseBtn && (
            <div
              onClick={onClose}
              className="absolute custom-cursor -top-12  right-0 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white sm:shadow-lg"
            >
              <IconImage icon="close-black" />
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
};

export default Dialog;
