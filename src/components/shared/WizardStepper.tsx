import clsx from "clsx";
import { CheckCircle, type LucideIcon } from "lucide-react";
import { useAppSelector } from "@/hooks/hooks";

export interface WizardStep {
  number: number;
  title: string;
  icon: LucideIcon;
}

interface WizardStepperProps {
  steps: WizardStep[];
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

  const getIconBg = (step: WizardStep) => {
    if (step.number === currentStep) return "bg-teal-600 text-white";
    if (step.number < currentStep) return "bg-green-600 text-white";
    if (stepsWithMissingFields.has(step.number))
      return "bg-amber-500 text-white";
    return isDark ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-500";
  };

  const getConnectorBg = (step: WizardStep) => {
    if (step.number < currentStep) return "bg-green-600";
    return isDark ? "bg-gray-800" : "bg-gray-200";
  };

  const currentStepData = steps.find((s) => s.number === currentStep);

  return (
    <div className="mb-4">
      {/* Mobile: compact dot strip + progress label */}
      <div className="flex md:hidden flex-col gap-2">
        {/* Dot strip */}
        <div className="flex items-center gap-1.5">
          {steps.map((step) => (
            <button
              key={step.number}
              onClick={() => onStepClick(step.number)}
              className="flex-1 flex items-center gap-1.5 min-w-0"
            >
              <div
                className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all",
                  getIconBg(step),
                  step.number === currentStep &&
                    "ring-2 ring-teal-400 ring-offset-1",
                )}
              >
                {step.number < currentStep ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <step.icon className="w-3 h-3" />
                )}
              </div>
              {step.number < totalSteps && (
                <div
                  className={clsx(
                    "flex-1 h-0.5 rounded transition-all",
                    getConnectorBg(step),
                  )}
                />
              )}
            </button>
          ))}
        </div>

        {/* Current step label */}
        <div
          className={clsx(
            "flex items-center gap-1.5 text-xs",
            isDark ? "text-gray-400" : "text-gray-500",
          )}
        >
          <span className="font-medium text-teal-600">
            {currentStep}/{totalSteps}
          </span>
          <span>—</span>
          <span className="truncate">{currentStepData?.title}</span>
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
