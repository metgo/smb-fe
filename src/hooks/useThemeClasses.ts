import { useAppSelector } from '@/hooks/hooks';
import { getThemeClasses } from '@/lib/theme';

export const useThemeClasses = (): ThemeClasses => {
  const { theme } = useAppSelector((state) => state.settings);

  return getThemeClasses(theme);
};
