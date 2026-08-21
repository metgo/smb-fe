import clsx from "clsx";
import { CheckCircle } from "lucide-react";
import { useRef, useEffect, Fragment } from "react";
import { useThemeClasses } from "@/hooks/useThemeClasses";

// Assuming this interface is defined elsewhere or globally
interface IWizardStep {
  number: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

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
  stepsWithMissingFields = new Set(),
  onStepClick,
}: WizardStepperProps) {
  const { isDark } = useThemeClasses();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const getIconBg = (step: IWizardStep) => {
    if (step.number === currentStep) return "bg-teal-600 text-white";
    if (step.number < currentStep) return "bg-emerald-500 text-white";
    if (stepsWithMissingFields.has(step.number))
      return "bg-amber-500 text-white";
    return isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500";
  };

  const getConnectorBg = (step: IWizardStep) => {
    if (step.number < currentStep) return "bg-emerald-500";
    return isDark ? "bg-gray-700" : "bg-gray-200";
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Auto-scroll to center the active tab
  useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const activeButton = activeTabRef.current;

      const containerWidth = container.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      const buttonWidth = activeButton.offsetWidth;

      // Calculate the scroll position to center the button
      const scrollPosition = buttonLeft - containerWidth / 2 + buttonWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentStep]);

  return (
    <div className=" overflow-hidden">
      {/* Mobile: horizontally scrollable stepper */}
      <div className="flex md:hidden">
        <div
          ref={scrollRef}
          className="flex items-start overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar:none"
        >
          {steps.map((step, index) => (
            <Fragment key={step.number}>
              <button
                ref={(el) => {
                  if (el) stepRefs.current.set(step.number, el);
                  else stepRefs.current.delete(step.number);
                }}
                onClick={() => onStepClick(step.number)}
                className="flex flex-col items-center shrink-0 w-16 group"
              >
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm",
                    getIconBg(step),
                    step.number === currentStep && "ring-2 ring-teal-400 ",
                  )}
                >
                  {step.number < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={clsx(
                    "mt-2 text-[11px] text-center leading-tight w-full line-clamp-2 transition-colors",
                    step.number === currentStep
                      ? "text-teal-600 font-semibold"
                      : isDark
                        ? "text-gray-400 group-hover:text-gray-200"
                        : "text-gray-500 group-hover:text-gray-900",
                  )}
                >
                  {step.title}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    "w-6 h-0.5 mt-3.75 shrink-0 rounded-full transition-all",
                    getConnectorBg(step),
                  )}
                />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Desktop: full stepper with icons, connectors, and labels */}
      <div
        ref={tabsContainerRef}
        className={clsx("hidden md:flex gap-2 overflow-x-auto scrollbar-hide pt-4")}
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
        }}
      >
        {steps.map((step, index) => (
          <Fragment key={step.number}>
            {/* Step Column: Icon + Text perfectly aligned */}
            <div
              onClick={() => onStepClick(step.number)}
              className="flex flex-col items-center shrink-0 cursor-pointer group"
              style={{ width: "70px" }}
            >
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm",
                  getIconBg(step),
                  step.number === currentStep &&
                  "ring-2 ring-teal-400 ring-offset-2 ring-offset-white scale-105",
                )}
              >
                {step.number < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>

              <span
                className={clsx(
                  "mt-2 text-xs text-center leading-tight w-full line-clamp-2 transition-colors",
                  step.number === currentStep
                    ? "text-teal-600 font-semibold"
                    : isDark
                      ? "text-gray-400 group-hover:text-gray-200"
                      : "text-gray-500 group-hover:text-gray-900",
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector between steps */}
            {index < steps.length - 1 && (
              <div
                className={clsx(
                  "flex-1 h-1 mt-4.5 rounded-full transition-all",
                  getConnectorBg(step),
                )}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
