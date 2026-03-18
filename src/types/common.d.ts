type Language = "en" | "ar" | "he";
type Theme = "light" | "dark";

type TViewMode = "list" | "grid";

type TStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "closed"
  | "archived";

type EventStatus = "draft" | "pending" | "approved";
type TOpMode = "CREATE" | "DUPLICATE" | "EDIT" | "VIEW" | "UPDATE" | "CLOSED";

interface Geo {
  lat: string;
  lng: string;
}

interface ITags {
  he: string;
  ar: string;
  en: string;
}

interface IWebsite {
  _id: string;
  name: string;
  websiteUrl: string;
  logo: string;
  dmoIds: string[];
  authorityIds: string[];
}

interface ITag {
  _id: string;
  name: string;
  nameHe: string;
  nameAr: string;
}
type TAllWebsites = IWebsite[];
type TAllTags = ITag[];

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
  id?: number;
  title?: string;
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

interface ISearchBusiness {
  _id: string;
  name: string;
  slug: string;
}

type TNotifStatus = "ALL" | "READ" | "UNREAD";

type TItemType = "ALL" | "BUSINESS" | "PRODUCT" | "EVENT" | "FUNDAY" | "TRIP";

type TNotifType =
  | "ALL"
  | "INFO"
  | "WARNING"
  | "ACTION"
  | "URGENT"
  | "ERROR"
  | "UNREAD";

type TItemStatus =
  | "PENDING"
  | "APPROVED"
  | "CLOSED"
  | "REJECTED"
  | "DRAFT"
  | "ARCHIVED";

type TOrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "shipped"
  | "canceled";
type TPaymentStatus = "PAID" | "UNPAID" | "PARTIAL" | "REFUNDED" | "SUCCESS";

type TSortDirection = "asc" | "desc" | null;
