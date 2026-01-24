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
  children: ReactNode
  infoText: string;
  showToolTip: boolean;
}


const TooltipWrapper: FC<TooltipWrapperProps> = ({ children, infoText, showToolTip }) => {
  const {theme}=useAppSelector((state)=>state.settings);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>

        {showToolTip && (
          <TooltipContent
            side="top"
            align="center"
            className={clsx(
              "px-6 py-4 shadow-md border border-teal-500 font-semibold",
              theme==="dark"? "text-white bg-black/60":"text-black bg-white/80"
            )}
          >
            <p>{infoText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>

  )
}

export default TooltipWrapper