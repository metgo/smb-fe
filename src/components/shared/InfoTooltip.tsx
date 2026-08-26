import { HelpCircle, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";

interface InfoTooltipProps {
  content?: string;
  title?: string;
  children?: ReactNode;
  width?: string;
}

export default function InfoTooltip({
  content,
  title,
  children,
  width = "w-80",
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    isRTL,
  } = useThemeClasses();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500",
          hoverBg,
        )}
        aria-label="Information"
        type="button"
      >
        <HelpCircle
          className={clsx(
            "w-4 h-4 hover:text-teal-600 transition-colors",
            textTertiary,
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div
            className={clsx(
              "absolute top-0 z-50 max-w-[90vw] rounded-lg shadow-xl border p-4",
              width,
              bgPrimary,
              borderColor,
              isRTL ? "left-0 ml-2" : "right-0 mr-2",
            )}
            style={{ marginTop: "-0.5rem" }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              {title && (
                <h4 className={clsx("font-medium text-sm", textPrimary)}>
                  {title}
                </h4>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "p-1 rounded transition-colors shrink-0 ms-auto",
                  hoverBg,
                )}
                aria-label="Close"
                type="button"
              >
                <X className={clsx("w-4 h-4", textTertiary)} />
              </button>
            </div>
            {children ? (
              <div className={clsx("text-sm leading-relaxed", textSecondary)}>
                {children}
              </div>
            ) : (
              <p className={clsx("text-sm leading-relaxed", textSecondary)}>
                {content}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
