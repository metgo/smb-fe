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
type TCampaign = "CASH_IN" | "CASH_BACK" | "MINI_SITE";

interface IWizardStep {
  number: number;
  title: string;
  icon: LucideIcon;
}

interface Geo {
  lat: string;
  long: string;
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
  isActive?: boolean;
  purpose: "MARKETPLACE" | "TRAVELING" | "OTHER";
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
  isActive?: boolean;
}

type EnrichedAuthority = {
  _id: string;
  name: string;
  logoPath?: string;
  dmoId: string;
  dmoName: string;
  dmoLogo?: string;
  isActive?: boolean;
};

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
  externalApiId?: string;
}

interface ISearchBusiness {
  _id: string;
  name: string;
  nameHe: string;
  nameAr: string;
  slug: string;
}

type TNotifStatus = "ALL" | "READ" | "UNREAD";

type TItemType = "ALL" | "BUSINESS" | "PRODUCT" | "EVENT" | "POI" | "DISPUTE";

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

interface IActionIconButton {
  title: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: "blue" | "green" | "red" | "yellow" | "gray";
  isLoading?: boolean;
  disabled?: boolean;
}

interface IMetaData {
  page: number;
  limit: number;
  data: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface IPagination {
  meta: IMetaData;
  totalData: number;
}

interface IDoucment {
  _id: string;
  title: string;
  imageUrl: string;
  templateKey: string;
  externalApiId: string;
}

interface IDocumentRes extends IPagination {
  data: Array<IDoucment>;
}
