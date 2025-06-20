

declare type LayoutItem = {
  width: number;
  height: number
};


interface SubCoordinates {
  xMax: number;
  xMin: number;
  yMax: number;
  yMin: number;
}

declare interface ImageItem {
  image: string;
  caption: string;
  alt: string;
  subCoordinates: SubCoordinates;
  isPrimary?: boolean;
}

interface GeoLocation {
  lat: string;
  long: string;
  _id: string;
}

interface Logo {
  image: string;
  caption: string;
  alt: string;
  subCoordinates: SubCoordinates;
  _id: string;
}

declare interface BusinessProps {
  _id: string;
  name: string;
  geoLocation: GeoLocation;
  images: ImageItem[];
  logo: Logo;
  location: string;
  imageUrl: string;
}

declare interface BusinessesProps {
  data: BusinessProps[];
  totalData?: number,
  meta: {
    page: number,
    limit: string,
    data: number,
    pageCount: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean
  }
}

declare type BusinessCardProps = {
  width: number;
  height: number;
  business: BusinessProps;
}

declare type FaviouriteBusinessProps = {
  _id: string;
  name: string;
  height: number;
  width: number;
  imageUrl: string;
  location: string;
};