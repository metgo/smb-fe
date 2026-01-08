import { useAppSelector } from '@/hooks/hooks';
import { getThemeClasses } from '@/lib/theme';

export const useThemeClasses = (): ThemeClasses => {
  const theme = useAppSelector((state) => state.theme.theme);
  return getThemeClasses(theme);
};
