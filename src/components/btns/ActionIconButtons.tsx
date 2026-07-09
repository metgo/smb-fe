import clsx from "clsx";
import TooltipWrapper from "@/components/wrapper/TooltipWrapper";
import { Loader2 } from "lucide-react";

interface ActionButtonsProps {
  actions: IActionIconButton[];
  isDark?: boolean;
  className?: string;
}

const colorClasses = {
  blue: {
    text: "text-blue-400",
    lightHover: "hover:bg-blue-50 hover:text-blue-600",
    darkHover: "hover:bg-blue-500/20 hover:text-blue-400",
  },
  green: {
    text: "text-green-400",
    lightHover: "hover:bg-green-50 hover:text-green-600",
    darkHover: "hover:bg-green-500/20 hover:text-green-400",
  },
  red: {
    text: "text-red-400",
    lightHover: "hover:bg-red-50 hover:text-red-600",
    darkHover: "hover:bg-red-500/20 hover:text-red-400",
  },
  yellow: {
    text: "text-yellow-400",
    lightHover: "hover:bg-yellow-50 hover:text-yellow-600",
    darkHover: "hover:bg-yellow-500/20 hover:text-yellow-400",
  },
  gray: {
    text: "text-gray-400",
    lightHover: "hover:bg-gray-50 hover:text-gray-600",
    darkHover: "hover:bg-gray-500/20 hover:text-gray-300",
  },
};

const ActionIconButtons = ({
  actions,
  isDark = false,
  className,
}: ActionButtonsProps) => {
  return (
    <div className={clsx("flex rounded-lg", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        const color = colorClasses[action.color ?? "gray"];

        return (
          <TooltipWrapper key={action.title} infoText={action.title}>
            <button
              disabled={action.disabled}
              onClick={action.onClick}
              className={clsx(
                "rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                color.text,
                isDark ? color.darkHover : color.lightHover,
              )}
            >
              {action.isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Icon size={16} />
              )}
            </button>
          </TooltipWrapper>
        );
      })}
    </div>
  );
};
export default ActionIconButtons;
