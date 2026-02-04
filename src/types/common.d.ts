type Language = "en" | "ar" | "he";
type Theme = "light" | "dark";
type TStatus = "draft" | "pending" | "approved" | "rejected" | "archived";

interface Geo {
  lat: string;
  lng: string;
}

interface IWebsite {
  _id: string;
  name: string;
  websiteUrl: string;
  logo: string;
  dmoIds: string[];
  authorityIds: string[];
}

type TAllWebsites = IWebsite[];

interface IFromattedAllWebsites {
  associatedWebsites: IWebsite[];
  unAssociatedWebsites: IWebsite[];
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
  exportBtnBgClasses: string;
}

interface PageStats {
  id: number;
  title: string;
  value: string | number;
  label?: string;
  labelClass?: string;
  icon: ReactNode;
}

interface IAuthority {
  _id: string;
  name: string;
  dmoId: string;
  logoPath?: string;
}

interface IDmo {
  _id: string;
  name: string;
  imagePath?: string;
  logoPath?: string;
  authorities: Authority[];
}

interface IDeleteTarget {
  imageUrl: string;
  index: number;
}

type TUploadStatus = "idle" | "uploading" | "success" | "error";

interface IImageUpload {
  id: number;
  file?: File;
  previewUrl: string;
  signedUrl?: string;
  gcsURL?: string;
  progress: number;
  status: UploadStatus;
  isPrimary?: boolean;
}

interface IImage {
  image: string;
  caption?: string;
  alt?: string;
  isPrimary?: boolean;
  subCoordinates?: SubCoordinates;
}
type TImages = IImage[];

interface IWebsiteVisibilityIds {
  allBlacklistIds: string[];
  selectedBlacklistIds: string[];
  allWhitelistIds: string[];
  selectedWhitelistIds: string[];
}

interface IAssociatedWebsiteIds {
  _id: string;
  name: string;
  url: string;
}
