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
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "end" | "start";
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
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        {showToolTip && (
          <TooltipContent
            side={side}
            align={align}
            sideOffset={8}
            className={clsx(
              "z-50 rounded-md px-3 py-1.5",
              "text-xs font-medium leading-none",
              "border",
              "shadow-lg",
              "animate-in fade-in-0 zoom-in-95 duration-150",
              isDark
                ? "border-neutral-700 bg-neutral-900 text-neutral-100"
                : "border-neutral-200 bg-white text-neutral-800",
            )}
          >
            {infoText}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipWrapper;
