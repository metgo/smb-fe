
type Language = 'en' | 'ar' | 'he';
type Theme = 'light' | 'dark';

interface ThemeClasses {
  hoverBg: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  borderColor: string;
  bgStatus: string;
  textStatus: string;
  cardClasses: string;
  inputClasses: string;
  selectInputClasses: string;
}

interface PageStats {
  id: number;
  title: string;
  value: string | number;
  label?: string;
  labelClass?: string;
  icon: ReactNode;
}