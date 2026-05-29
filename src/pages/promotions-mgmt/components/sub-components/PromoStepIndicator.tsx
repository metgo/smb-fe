import clsx from "clsx";
import { Check } from "lucide-react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

interface PromoStepIndicatorProps {
  STEPS: {
    key: string;
    label: string;
    sublabel: string;
    icon: React.ElementType;
  }[];
  currentStep: number;
  setCurrentStep: (v: number) => void;
}

const PromoStepIndicator = ({
  STEPS,
  currentStep,
  setCurrentStep,
}: PromoStepIndicatorProps) => {
  const { isDark, textPrimary, textSecondary, textTertiary } =
    useThemeClasses();

  const trackFill =
    STEPS.length > 1 ? (currentStep / (STEPS.length - 1)) * 100 : 0;

  return (
    <div className="relative px-6 py-5">
      {/* Single continuous track line spanning all nodes */}
      <div
        className="absolute h-0.5 rounded-full overflow-hidden"
        style={{
          top: "calc(1.25rem + 1.25rem)", // py-5 + half of h-10
          left: `calc(1.5rem + (100% - 3rem) / ${2 * STEPS.length})`,
          right: `calc(1.5rem + (100% - 3rem) / ${2 * STEPS.length})`,
        }}
      >
        <div
          className={clsx(
            "absolute inset-0 rounded-full",
            isDark ? "bg-gray-700" : "bg-gray-200",
          )}
        />
        <div
          className="absolute inset-y-0 left-0 bg-green-600 transition-all duration-500 rounded-full"
          style={{ width: `${trackFill}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const done = idx < currentStep;
          const active = idx === currentStep;
          const future = idx > currentStep;
          return (
            <div
              key={step.key}
              className="flex-1 flex flex-col items-center z-10 cursor-pointer"
              onClick={() => setCurrentStep(idx)}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  done
                    ? [
                        "bg-green-600 border-green-600 text-white",
                        isDark
                          ? "shadow-green-900"
                          : "shadow-md shadow-green-200",
                      ]
                    : active
                      ? [
                          isDark ? "bg-gray-900" : "bg-white",
                          "border-green-600 text-green-600",
                          isDark
                            ? "shadow-green-900/40"
                            : "shadow-md shadow-green-100",
                        ]
                      : [
                          isDark
                            ? "border-gray-700 bg-gray-900"
                            : "border-gray-200 bg-white",
                          textTertiary,
                        ],
                )}
              >
                {done ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <div className="mt-1.5 text-center">
                <p
                  className={`text-xs font-semibold leading-tight ${
                    active
                      ? "text-green-600"
                      : done
                        ? textPrimary
                        : textTertiary
                  }`}
                >
                  {step?.label}
                </p>
                <p
                  className={`text-[10px] leading-tight hidden sm:block ${
                    future ? textTertiary : textSecondary
                  }`}
                >
                  {step?.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PromoStepIndicator;
