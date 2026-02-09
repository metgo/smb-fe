import { useAppSelector } from "@/hooks/hooks";
import { getThemeClasses } from "@/lib/theme";

export const useThemeClasses = (): ThemeClasses & {
  colDir: string;
  rowDir: string;
  theme: Theme;
  isDark: boolean;
  isRTL: boolean;
  language: Language;
} => {
  const { theme, isRTL, language } = useAppSelector((state) => state.settings);
  const rowDir = isRTL ? "flex-row-reverse" : "flex-row";
  const colDir = isRTL ? "flex-col-reverse" : "flex-col";
  const isDark = theme === "dark";

  return {
    ...getThemeClasses(isDark),
    rowDir,
    colDir,
    theme,
    isDark,
    isRTL,
    language,
  };
};
