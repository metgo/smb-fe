import clsx from "clsx";

import { useThemeClasses } from "@/hooks/useThemeClasses";

export const useUtmFormStyles = () => {
  const { isDark, textSecondary, textTertiary } = useThemeClasses();

  const themedField = isDark
    ? "bg-gray-800 border-gray-700 text-white"
    : "bg-white border-gray-300 text-gray-900";

  return {
    fieldLabel: clsx(
      "text-[13px] font-medium mb-1.5 flex items-center gap-1",
      textSecondary,
    ),
    optionalTag: clsx("text-[11px] font-normal", textTertiary),
    helpText: clsx(
      "text-[11px] font-normal italic mt-1 leading-relaxed",
      textTertiary,
    ),
    inputClass: clsx("h-10", themedField),
    comboClass: clsx(
      "w-full h-10 rounded-md border px-3 text-sm outline-none transition-colors",
      "focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30",
      themedField,
    ),
  };
};
