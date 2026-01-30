import { useAppSelector } from "@/hooks/hooks";
import { getThemeClasses } from "@/lib/theme";

export const useThemeClasses = (): ThemeClasses & {
  colDir: string;
  rowDir: string;
  theme: Theme;
  isDark: boolean;
} => {
  const { theme, isRTL } = useAppSelector((state) => state.settings);
  const rowDir = isRTL ? "flex-row-reverse" : "flex-row";
  const colDir = isRTL ? "flex-col-reverse" : "flex-col";
  const isDark = theme === "dark";

  return {
    ...getThemeClasses(theme),
    rowDir,
    colDir,
    theme,
    isDark,
  };
};
