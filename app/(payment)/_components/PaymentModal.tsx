import { useEffect } from "react";

interface PaymentModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({
  children,
  isOpen,
  onClose,
}: PaymentModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <div className="fixed inset-0 bg-black  bg-opacity-70 z-50 flex items-center justify-center">
      <div className="relative w-[80vw] max-sm:max-h-[85vh]  min-h-[70vh] bg-white rounded-xl">
        <button
          className="absolute -top-12 left-0 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg cursor-pointer"
          onClick={onClose}
        >
          {/* <LightClose /> */}
          <div>X</div>
        </button>
        <div className="py-2 mr-2 h-full">{children}</div>
      </div>
    </div>
  );
}
