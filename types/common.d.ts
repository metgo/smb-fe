declare type ReactChildNode = {
  children: React.ReactNode;
};

interface HomeVideo {
  url: string;
  isActive: boolean;
}

interface SiteConfig {
  name: string;
  metaTitle: string;
  metaDescription: string;
  siteName: string;
  desktopHomeVideos: HomeVideo[];
  mobileHomeVideos: HomeVideo[];
}

interface RouteResponse {
  routes: Array<{
    polyline: {
      encodedPolyline: string;
    };
  }>;
}

interface SearchParamsProps {
  searchParams: Promise<{
    page: string;
    categoryId: string;
    subCategoryId: string;
    productId: string;
  }>;
}

declare type PageProps = {
  params: { slug: string } | any;
};

declare type LayoutItem = {
  width: number;
  height: number;
};

declare interface SubCoordinates {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
}

declare interface ImageItem {
  image: string;
  caption?: string;
  alt: string;
  subCoordinates?: SubCoordinates;
  isPrimary?: boolean;
}

declare interface GeoLocation {
  lat: string;
  long: string;
  _id: string;
}

declare interface Attributes {
  _id: string;
  name: string;
  hebrewName: string;
  icon?: string;
}

declare interface LogoCover {
  image: string;
  caption: string;
  alt: string;
  subCoordinates: SubCoordinates;
}

declare interface GeneralProductCardProps {
  _id: string;
  name: string;
  slug: string;
  description: string;
  dmoId: string;
  images: ImageItem[];
  logo: LogoCover;
  navPath?: string;
}

declare interface SearchResultProps {
  events?: GeneralProductCardProps[];
  products?: GeneralProductCardProps[];
  businesses?: GeneralProductCardProps[];
}

declare interface PaginationMeta {
  page: number;
  limit: number;
  data: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

declare interface FeedItem {
  _id: string;
  name: string;
  slug: string;
  serviceType: string;
  description: string;
  images: ImageItem[];
  cover: ImageItem;
  primaryCategoryId?: string;
  address: {
    city?: string;
    address?: string;
    location?: string;
  };
}
declare type FeedItemList = FeedItem[];

declare interface FeedCardProps {
  height: number;
  width: number;
  feedItem: FeedItem;
}

declare interface LocationProps {
  _id: string;
  slug: string;
  geoLocation: GeoLocation;
  primaryCategoryId: string;
}

declare type LocationListProps = LocationProps[];

declare interface LocationStationDetailsProps {
  _id: string;
  name: string;
  description: string;
  authorityId: string;
  dmo: string;
  images: ImageItem[];
  logo: ImageItem;
  primaryCategoryId: string;
  slug: string;
}

interface PromotionalItem {
  _id: string;
  name: string;
  description: string;
  slug: string;
  image?: ImageItem;
  itemType: "business" | "event" | "product" | "funDays" | string; // extendable for flexibility
}

interface PromotionalItemsResponse {
  allPromotionalItems: PromotionalItem[];
}

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  categoryId: string;
}

interface GroupType {
  _id: string;
  name: string;
}

interface Accessibility {
  _id: string;
  name: string;
}

interface FiltersResponse {
  categories: Category[];
  subCategories: SubCategory[];
  groupTypes: GroupType[];
  accessibilities: Accessibility[];
  displayBusinesses: boolean;
  displayEvents: boolean;
  displayFunday: boolean;
  displayPOI: boolean;
  displayTrips: boolean;
}
