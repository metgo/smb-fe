"use client";

import clsx from "clsx";
import { IoClose } from "react-icons/io5";
import { ReactNode, useEffect } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  modalClassName: string;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  modalClassName,
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
    <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 backdrop-blur-sm sm:flex items-center justify-center max-sm:p-0 p-4 z-[999]">
      <div
        className={clsx(modalClassName, "bg-white relative rounded-xl px-7.5")}
      >
        <div
          onClick={onClose}
          className="absolute cursor-pointer -top-12  right-0 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white sm:shadow-lg"
        >
          <IoClose />
        </div>
        {children}
      </div>
    </div>
  );
};

export default Dialog;
