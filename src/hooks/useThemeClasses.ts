import { useAppSelector } from '@/hooks/hooks';
import { getThemeClasses } from '@/lib/theme';

export const useThemeClasses = (): ThemeClasses & { colDir: string; rowDir: string } => {
  const { theme, isRTL } = useAppSelector((state) => state.settings);
  const rowDir = isRTL ? "flex-row-reverse" : "flex-row";
  const colDir = isRTL ? "flex-col-reverse" : "flex-col";

  return {
    ...getThemeClasses(theme),
    rowDir,
    colDir,
  };
};
