
type Language = 'en' | 'ar' | 'he';
type Theme = 'light' | 'dark';

interface Geo {
  lat: string;
  lng: string;
}

interface Website {
  _id: string;
  name: string;
}

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

type IAuthority = {
  _id: string;
  name: string;
  dmoId: string;
  logoPath?: string;
};

type IDmo = {
  _id: string;
  name: string;
  imagePath?: string;
  logoPath?: string;
  authorities: Authority[];
};