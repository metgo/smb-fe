declare type LayoutItem = {
  width: number;
  height: number;
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
  subCoordinates?: SubCoordinates;
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
  slug?: string;
  name: string;
  geoLocation: GeoLocation;
  images: ImageItem[];
  logo: Logo;
  address: {
    _id: string;
    city: string;
    country: string;
    location: string;
  };
  imageUrl: string;
  primaryCategoryId: string;
}

declare interface BusinessesProps {
  data: BusinessProps[];
  totalData?: number;
  meta?:
    | {
        page: number;
        limit: string;
        data: number;
        pageCount: number;
        hasPreviousPage: boolean;
        hasNextPage: boolean;
      }
    | any;
}

declare type BusinessCardProps = {
  width: number;
  height: number;
  business: BusinessProps;
};

declare type FaviouriteBusinessProps = {
  _id: string;
  name: string;
  height: number;
  width: number;
  imageUrl: string;
  location: string;
};

declare type BusinessMakerProps = {
  _id: string;
  primaryCategoryId: string;
  geoLocation: {
    _id: string;
    lat: string;
    long: string;
  };
};

declare type BusinessCategoryProps = {
  id: string;
  name: string;
  productCount: number;
}[];

declare type BusienssSubcategoryProps = {
  id: string;
  name: string;
  productCount: number;
  parent: string[];
}[];

declare type ProductProps = {
  _id: number;
  name: string;
  desc?: string;
  price: string;
  images: ImageItem[];
};

// ------------------------------------------------------

interface Address {
  country: string;
  city: string;
  location: string;
  _id: string;
}

interface ContactDetails {
  name: string;
  countryCode: string;
  phone: string;
  address: string;
  email: string;
  whatsAppCountryCode: string | null;
  whatsAppNumber: string;
  prefferedChannel: string;
  _id: string;
}

interface GeoLocation {
  lat: string;
  long: string;
  _id: string;
}

interface Location {
  type: string;
  coordinates: [number, number];
}

interface Price {
  markedPrice: number;
  discountAmount: number;
  discountPercent: number;
  sellingPrice: number;
  _id: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  businessId: string;
  images: ImageData[];
  price: Price;
}
interface LogoCover {
  image: string;
  caption: string;
  alt: string;
  subCoordinates: SubCoordinates;
}

interface Accessibilities {
  _id: string;
  name: string;
  hebrewName: string;
}

declare interface BusinessDetailsProps {
  _id: string;
  name: string;
  address: Address;
  phoneNumber: string;
  busiEmail: string;
  shortDescription: string;
  description: string;
  contactDetails: ContactDetails;
  dmoId: string;
  geoLocation: GeoLocation;
  location: Location;
  images: ImageItem[];
  groupTypesId: Accessibilities[];
  accessibilitiesId: Accessibilities[];
  primaryCategoryId: string;
  bussCategoriesId: string[];
  bussSubCategoriesId: string[];
  openingHrs: any[];
  isAlwaysOpen: boolean;
  slug: string;
  impact: number;
  socialMedia: any[];
  logo: LogoCover;
  cover: LogoCover;
  countryCode: string | null;
  products: Product[];
}
