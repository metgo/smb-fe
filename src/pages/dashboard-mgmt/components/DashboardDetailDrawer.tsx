import clsx from "clsx";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useThemeClasses } from "@/hooks/useThemeClasses";

interface DashboardDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function DashboardDetailDrawer({
  isOpen,
  onClose,
  title,
  description,
  children,
}: DashboardDetailDrawerProps) {
  const { t } = useTranslation("dashboard_mock");
  const { isDark } = useThemeClasses();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    closeButtonRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-drawer-title"
        className={clsx(
          "dm-glass relative w-full sm:max-w-md h-full overflow-y-auto shadow-xl p-5 rounded-l-3xl",
          isDark ? "dm-glass--dark text-white" : "text-gray-900",
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 id="dashboard-drawer-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p
                className={clsx(
                  "text-sm mt-1",
                  isDark ? "text-gray-400" : "text-gray-500",
                )}
              >
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className={clsx(
              "p-1.5 rounded-md shrink-0 cursor-pointer",
              isDark
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-500",
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
