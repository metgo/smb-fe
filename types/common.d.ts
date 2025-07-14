declare type ReactChildNode = {
  children: React.ReactNode;
};

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
declare interface DeliveryProps {
  deliveryArea: DeliveryArea[];
  deliverySpecificSellerInfo: string[];
  deliveryReturnExchange: string[];
  deliveryAdditionalInfo: string;
}
