import { clsx } from "clsx";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  Settings,
  ImageIcon,
  Video,
  Palette,
  Share2,
  Phone,
  Search,
  BarChart2,
  Globe,
  Gift,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StepMeta {
  icon: React.ElementType;
  label: string;
}

interface StepIndicatorProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isDark?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STEP_META: StepMeta[] = [
  { icon: Settings, label: "general" },
  { icon: Gift, label: "campaigns" },
  { icon: ImageIcon, label: "step_branding" },
  { icon: Video, label: "step_videos" },
  { icon: Palette, label: "step_theme" },
  { icon: Share2, label: "step_social" },
  { icon: Phone, label: "step_contact" },
  { icon: Search, label: "step_seo" },
  { icon: BarChart2, label: "step_analytics" },
  { icon: Globe, label: "step_language" },
];

const TOTAL_STEPS = STEP_META.length;

// ─── Component ────────────────────────────────────────────────────────────────

export function StepIndicator({
  currentStep,
  setCurrentStep,
  isDark = false,
}: StepIndicatorProps) {
  const { t } = useTranslation("website_settings");

  return (
    <div
      className={clsx(
        "w-full border rounded-xl overflow-hidden",
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
      )}
    >
      {/* Pill row */}
      <div className="flex items-center px-1.5 gap-0.5 h-11 overflow-x-auto">
        {STEP_META.map(({ icon: Icon, label }, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;

          return (
            <div key={step} className="flex items-center gap-0.5 shrink-0">
              {/* Connector line (skip before first pill) */}
              {i > 0 && (
                <div
                  className={clsx(
                    "w-16 h-px shrink-0 transition-colors duration-300",
                    isCompleted
                      ? "bg-teal-500"
                      : isDark
                        ? "bg-gray-700"
                        : "bg-gray-200",
                  )}
                />
              )}

              {/* Pill button */}
              <button
                onClick={() => setCurrentStep(step)}
                aria-current={isActive ? "step" : undefined}
                className={clsx(
                  "flex items-center gap-1.5 px-2.5 h-7 rounded-full transition-all duration-200 whitespace-nowrap select-none",
                  isActive
                    ? "bg-teal-500 shadow-sm"
                    : isCompleted
                      ? isDark
                        ? "bg-teal-500/15 hover:bg-teal-500/25 cursor-pointer"
                        : "bg-teal-50 hover:bg-teal-100 cursor-pointer"
                      : "cursor-default opacity-45",
                )}
              >
                {/* Icon */}
                <span
                  className={clsx(
                    "flex items-center justify-center transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : isCompleted
                        ? "text-teal-600"
                        : isDark
                          ? "text-gray-200"
                          : "text-gray-800",
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </span>

                {/* Label */}
                <span
                  className={clsx(
                    "text-xs font-medium leading-none transition-colors duration-200",
                    isActive
                      ? "text-white"
                      : isCompleted
                        ? "text-teal-700"
                        : isDark
                          ? "text-gray-200"
                          : "text-gray-800",
                  )}
                >
                  {t(label)}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        className={clsx("h-0.5 w-full", isDark ? "bg-gray-800" : "bg-gray-100")}
      >
        <div
          className="h-full bg-teal-500 transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}
