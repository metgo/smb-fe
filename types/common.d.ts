declare type ReactChildNode = {
  children: React.ReactNode;
};

declare type PageProps = {
  params: { slug: string };
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
