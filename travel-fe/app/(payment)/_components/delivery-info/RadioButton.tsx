import { FaCircleCheck } from "react-icons/fa6";
import { memo } from "react";

interface RadioButtonProps {
  isSelected: boolean;
}

export const RadioButton = memo(({ isSelected }: RadioButtonProps) => (
  <div
    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
      isSelected ? "border-0" : "bg-white"
    }`}
  >
    {isSelected && <FaCircleCheck size={30} />}
  </div>
));

RadioButton.displayName = "RadioButton";
