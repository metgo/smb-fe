import { HelpCircle, X } from "lucide-react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import clsx from "clsx";

interface InfoTooltipProps {
  content?: string;
  title?: string;
  children?: ReactNode;
  width?: string;
  /**
   * Render the panel with `position: fixed` so it escapes ancestors that clip
   * with `overflow-hidden`. Use when the trigger sits inside a clipped container.
   */
  elevated?: boolean;
}

export default function InfoTooltip({
  content,
  title,
  children,
  width = "w-80",
  elevated = false,
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );
  const {
    bgPrimary,
    textPrimary,
    textSecondary,
    textTertiary,
    borderColor,
    hoverBg,
    isRTL,
  } = useThemeClasses();

  // When elevated, the panel is `fixed`, so position it against the trigger's
  // viewport rect each time it opens.
  useLayoutEffect(() => {
    if (!elevated || !isOpen || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setCoords(
      isRTL
        ? { top: r.bottom + 8, left: r.left }
        : { top: r.bottom + 8, left: r.right },
    );
  }, [elevated, isOpen, isRTL]);

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
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
            className={clsx("fixed inset-0", elevated ? "z-90" : "z-40")}
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div
            className={clsx(
              "max-w-[90vw] rounded-lg shadow-xl border p-4",
              width,
              bgPrimary,
              borderColor,
              elevated
                ? "fixed z-800"
                : clsx("absolute top-0 z-50", isRTL ? "right-0" : "left-0"),
            )}
            style={
              elevated
                ? coords
                  ? {
                      top: coords.top,
                      ...(isRTL
                        ? { left: coords.left }
                        : {
                            left: coords.left,
                            transform: "translateX(-100%)",
                          }),
                    }
                  : { visibility: "hidden" }
                : { marginTop: "-0.5rem" }
            }
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              {title && (
                <h4 className={clsx("font-bold text-[13px]", textPrimary)}>
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
              <div className={clsx("text-xs leading-relaxed", textSecondary)}>
                {children}
              </div>
            ) : (
              <p className={clsx("text-xs leading-relaxed", textSecondary)}>
                {content}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
