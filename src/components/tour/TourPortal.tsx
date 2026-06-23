import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Compass, X } from "lucide-react";

import { useTour } from "./TourContext";
import type { TourStep } from "./TourContext";
import { useThemeClasses } from "@/hooks/useThemeClasses";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_WIDTH = 360;
const SPOTLIGHT_PADDING = 10;
const SPOTLIGHT_RADIUS = 10;
const TOOLTIP_GAP = 14;
const MOBILE_BREAKPOINT = 640;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clampLeft(center: number, winW: number): number {
  return Math.min(
    Math.max(center - CARD_WIDTH / 2, 16),
    winW - CARD_WIDTH - 16,
  );
}

function computeCardPosition(
  rect: DOMRect | null,
  placement: TourStep["placement"],
  isRTL: boolean,
): React.CSSProperties {
  const winW = window.innerWidth;
  const winH = window.innerHeight;

  // On mobile always anchor the card to the bottom of the screen so it is
  // never clipped or hidden behind a spotlighted element.
  if (winW < MOBILE_BREAKPOINT) {
    return { bottom: 16, left: 16, right: 16, width: "auto" };
  }

  if (!rect || placement === "center" || !placement) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const centerX = rect.left + rect.width / 2;

  switch (placement) {
    case "bottom":
      return { top: rect.bottom + TOOLTIP_GAP, left: clampLeft(centerX, winW) };

    case "top":
      return {
        bottom: winH - rect.top + TOOLTIP_GAP,
        left: clampLeft(centerX, winW),
      };

    case "right":
      return isRTL
        ? {
            top: Math.min(rect.top, winH - 240),
            right: winW - rect.left + TOOLTIP_GAP,
          }
        : {
            top: Math.min(rect.top, winH - 240),
            left: rect.right + TOOLTIP_GAP,
          };

    case "left":
      return isRTL
        ? {
            top: Math.min(rect.top, winH - 240),
            left: rect.right + TOOLTIP_GAP,
          }
        : {
            top: Math.min(rect.top, winH - 240),
            right: winW - rect.left + TOOLTIP_GAP,
          };

    default:
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
}

// ─── Spotlight SVG ────────────────────────────────────────────────────────────

function TourSpotlight({
  targetRect,
  isDark,
}: {
  targetRect: DOMRect | null;
  isDark: boolean;
}) {
  const spotlight = targetRect
    ? {
        x: targetRect.x - SPOTLIGHT_PADDING,
        y: targetRect.y - SPOTLIGHT_PADDING,
        width: targetRect.width + SPOTLIGHT_PADDING * 2,
        height: targetRect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  return (
    <svg
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <defs>
        <mask id="tour-spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          {spotlight && (
            <motion.rect
              animate={spotlight}
              initial={spotlight}
              transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              rx={SPOTLIGHT_RADIUS}
              fill="black"
            />
          )}
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={isDark ? "rgba(0,0,0,0.78)" : "rgba(0,0,0,0.62)"}
        mask="url(#tour-spotlight-mask)"
      />
      {spotlight && (
        <motion.rect
          animate={spotlight}
          initial={spotlight}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
          rx={SPOTLIGHT_RADIUS}
          fill="none"
          stroke="rgba(20,184,166,0.6)"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}

// ─── Tour Card ────────────────────────────────────────────────────────────────

function TourCard() {
  const { steps, currentStep, targetRect, endTour, nextStep, prevStep } =
    useTour();
  const { isDark, isRTL } = useThemeClasses();
  const { t } = useTranslation("tour");

  const step = steps[currentStep];
  const total = steps.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === total - 1;
  const progress = ((currentStep + 1) / total) * 100;

  const cardPos = computeCardPosition(targetRect, step.placement, isRTL);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, y: 10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.97 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        style={{
          position: "fixed",
          zIndex: 10000,
          width: CARD_WIDTH,
          pointerEvents: "all",
          ...cardPos,
        }}
        dir={isRTL ? "rtl" : "ltr"}
        className={`rounded-2xl shadow-2xl overflow-hidden select-none ${
          isDark
            ? "bg-gray-900 border border-gray-700/60 shadow-black/40"
            : "bg-white border border-gray-200/80 shadow-gray-300/50"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-500/15 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-teal-500" />
            </div>
            <span
              className={`text-[11px] font-semibold tracking-widest uppercase ${
                isDark ? "text-teal-400" : "text-teal-600"
              }`}
            >
              {t("nav.step_of", { current: currentStep + 1, total })}
            </span>
          </div>

          <button
            onClick={endTour}
            aria-label="Close tour"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "text-gray-500 hover:text-gray-300 hover:bg-gray-800"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div
          className={`mx-5 h-[3px] rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
        >
          <motion.div
            className="h-full rounded-full bg-teal-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-3">
          <h3
            className={`text-[15px] font-bold mb-1.5 leading-snug ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {step.title}
          </h3>
          <p
            className={`text-[13px] leading-relaxed ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {step.desc}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-5 h-1.5 bg-teal-500"
                  : isDark
                    ? "w-1.5 h-1.5 bg-gray-700"
                    : "w-1.5 h-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-t ${
            isDark ? "border-gray-800" : "border-gray-100"
          }`}
        >
          <button
            onClick={endTour}
            className={`text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? "text-gray-600 hover:text-gray-400"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t("nav.skip")}
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={prevStep}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isDark
                    ? "text-gray-300 hover:bg-gray-800 border border-gray-700"
                    : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {isRTL ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronLeft className="w-3.5 h-3.5" />
                )}
                {t("nav.back")}
              </button>
            )}

            <button
              onClick={nextStep}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm transition-colors cursor-pointer"
            >
              {isLast ? t("nav.finish") : t("nav.next")}
              {!isLast &&
                (isRTL ? (
                  <ChevronLeft className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                ))}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Portal ───────────────────────────────────────────────────────────────────

export function TourPortal() {
  const { isOpen, targetRect } = useTour();
  const { isDark } = useThemeClasses();

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div style={{ position: "absolute", inset: 0, pointerEvents: "all" }}>
          <TourSpotlight targetRect={targetRect} isDark={isDark} />
        </div>
        <TourCard />
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
