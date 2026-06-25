import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TourStep {
  id: string;
  target?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  title: string;
  desc: string;
}

interface StartTourOptions {
  tourId?: string;
  autoOnce?: boolean;
}

interface TourContextValue {
  isOpen: boolean;
  currentStep: number;
  steps: TourStep[];
  targetRect: DOMRect | null;
  startTour: (steps: TourStep[], options?: StartTourOptions) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  /** Re-query the current step's target element and update the spotlight rect.
   *  Call this after programmatically revealing a DOM element (e.g. opening a dropdown). */
  refreshTargetRect: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TourProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const resolveTargetRect = useCallback(
    (step: TourStep | undefined, animate = true) => {
      if (!step?.target) return setTargetRect(null);
      const el = document.querySelector<HTMLElement>(step.target);
      if (!el) return setTargetRect(null);
      el.scrollIntoView({
        behavior: animate ? "smooth" : "auto",
        block: "nearest",
      });
      const delay = animate ? 180 : 0;
      setTimeout(() => setTargetRect(el.getBoundingClientRect()), delay);
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || !steps.length) return;
    resolveTargetRect(steps[currentStep]);
  }, [isOpen, currentStep, steps, resolveTargetRect]);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => resolveTargetRect(steps[currentStep], false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isOpen, currentStep, steps, resolveTargetRect]);

  const startTour = useCallback(
    (newSteps: TourStep[], options?: StartTourOptions) => {
      if (options?.autoOnce && options.tourId) {
        if (localStorage.getItem(`tour_seen_${options.tourId}`)) return;
        localStorage.setItem(`tour_seen_${options.tourId}`, "1");
      }
      setSteps(newSteps);
      setCurrentStep(0);
      setIsOpen(true);
    },
    [],
  );

  const endTour = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setCurrentStep(0), 300);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= steps.length - 1) {
        setIsOpen(false);
        setTimeout(() => setCurrentStep(0), 300);
        return prev;
      }
      return prev + 1;
    });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const refreshTargetRect = useCallback(() => {
    resolveTargetRect(steps[currentStep], false);
  }, [steps, currentStep, resolveTargetRect]);

  return (
    <TourContext.Provider
      value={{
        isOpen,
        currentStep,
        steps,
        targetRect,
        startTour,
        endTour,
        nextStep,
        prevStep,
        refreshTargetRect,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}
