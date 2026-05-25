import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FC, ReactNode } from "react";
import { useAppSelector } from "@/hooks/hooks";

interface TooltipWrapperProps {
  children: ReactNode;
  infoText: string;
  showToolTip?: boolean;
  side?: "top" | "right" | "bottom" | "left" | undefined;
  align?: "center" | "end" | "start" | undefined;
}

const TooltipWrapper: FC<TooltipWrapperProps> = ({
  children,
  infoText,
  showToolTip = true,
  side = "top",
  align = "center",
}) => {
  const { theme } = useAppSelector((state) => state.settings);
  const isDark = theme === "dark";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        {showToolTip && (
          <TooltipContent
            side={side}
            align={align}
            sideOffset={8}
            className={clsx(
              // Layout & shape
              "relative px-3.5 py-2 rounded-lg",
              // Typography
              "text-[13px] font-medium tracking-wide leading-snug",
              // Animation (Radix adds data-state="delayed-open" / "closed")
              "will-change-[opacity,transform]",
              "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=top]:slide-in-from-bottom-1",
              "data-[side=bottom]:slide-in-from-top-1",
              "data-[side=left]:slide-in-from-right-1",
              "data-[side=right]:slide-in-from-left-1",
              // Duration
              "duration-150 ease-out",
              // Theme: dark
              isDark
                ? [
                    "bg-neutral-900/80 backdrop-blur-md",
                    "text-neutral-100",
                    "border border-white/10",
                    "shadow-[0_4px_24px_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]",
                  ]
                : // Theme: light
                  [
                    "bg-white/90 backdrop-blur-md",
                    "text-neutral-800",
                    "border border-black/8",
                    "shadow-[0_4px_20px_rgba(0,0,0,0.10),0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
                  ],
            )}
          >
            {/* Subtle left accent stripe */}
            <span
              className={clsx(
                "absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-[60%] rounded-full",
                isDark ? "bg-teal-400/70" : "bg-teal-500/80",
              )}
            />

            <span className="pl-2">{infoText}</span>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipWrapper;
