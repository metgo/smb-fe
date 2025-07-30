declare type ReactChildNode = {
  children: React.ReactNode;
};

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
  caption: string;
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

declare interface paginationMeta {
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
  description: string;
  images: ImageItem[];
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
