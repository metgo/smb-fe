import clsx from "clsx";
import { CheckCircle } from "lucide-react";
import { useRef, useEffect } from "react";
import { useAppSelector } from "@/hooks/hooks";

interface WizardStepperProps {
  steps: IWizardStep[];
  currentStep: number;
  totalSteps: number;
  stepsWithMissingFields?: Set<number>;
  onStepClick: (step: number) => void;
}

export default function WizardStepper({
  steps,
  currentStep,
  totalSteps,
  stepsWithMissingFields = new Set(),
  onStepClick,
}: WizardStepperProps) {
  const { theme } = useAppSelector((state) => state.settings);
  const isDark = theme === "dark";

  const getIconBg = (step: IWizardStep) => {
    if (step.number === currentStep) return "bg-teal-600 text-white";
    if (step.number < currentStep) return "bg-green-600 text-white";
    if (stepsWithMissingFields.has(step.number))
      return "bg-amber-500 text-white";
    return isDark ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-500";
  };

  const getConnectorBg = (step: IWizardStep) => {
    if (step.number < currentStep) return "bg-green-600";
    return isDark ? "bg-gray-800" : "bg-gray-200";
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  useEffect(() => {
    const el = stepRefs.current.get(currentStep);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentStep]);

  return (
    <div className="mb-4">
      {/* Mobile: horizontally scrollable stepper */}
      <div className="flex md:hidden">
        <div
          ref={scrollRef}
          className="flex items-start overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {steps.map((step) => (
            <div key={step.number} className="flex items-start shrink-0">
              <button
                ref={(el) => {
                  if (el) stepRefs.current.set(step.number, el);
                  else stepRefs.current.delete(step.number);
                }}
                onClick={() => onStepClick(step.number)}
                className="flex flex-col items-center gap-1 w-16 shrink-0"
              >
                <div
                  className={clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                    getIconBg(step),
                    step.number === currentStep &&
                      "ring-2 ring-teal-400 ring-offset-1",
                  )}
                >
                  {step.number < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={clsx(
                    "text-[10px] text-center leading-tight w-full px-0.5 truncate transition-colors",
                    step.number === currentStep
                      ? "text-teal-600 font-medium"
                      : isDark
                        ? "text-gray-500"
                        : "text-gray-400",
                  )}
                >
                  {step.title}
                </span>
              </button>

              {step.number < totalSteps && (
                <div
                  className={clsx(
                    "w-6 h-0.5 mt-3.5 shrink-0 rounded transition-all",
                    getConnectorBg(step),
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: full stepper with icons, connectors, and labels */}
      <div className="hidden md:flex items-start gap-1">
        {steps.map((step) => (
          <div
            key={step.number}
            onClick={() => onStepClick(step.number)}
            className="flex-1 cursor-pointer min-w-0"
          >
            <div className="flex items-center gap-1">
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                  getIconBg(step),
                  step.number === currentStep &&
                    "ring-2 ring-teal-400 ring-offset-1",
                )}
              >
                {step.number < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>

              {step.number < totalSteps && (
                <div
                  className={clsx(
                    "flex-1 h-1 rounded transition-all",
                    getConnectorBg(step),
                  )}
                />
              )}
            </div>

            <div className="mt-1 pr-1">
              <span
                className={clsx(
                  "text-xs block text-center truncate transition-colors",
                  step.number === currentStep
                    ? "text-teal-600 font-medium"
                    : isDark
                      ? "text-gray-500"
                      : "text-gray-400",
                )}
              >
                {step.title}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
