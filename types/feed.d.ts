interface FiltersProps {
  categoryIds?: string[];
  subCategoryIds?: string[];
  groupTypesIds?: string[];
  accessibilitiesIds?: string[];
  serviceTypes?: string[];
}

interface Logo {
  image: string;
  caption: string;
  alt: string;
  subCoordinates: SubCoordinates;
  _id: string;
}

declare interface FeedItem {
  _id: string;
  slug: string;
  name: string;
  serviceType: string;
  geoLocation: GeoLocation;
  images: ImageItem[];
  cover: ImageItem;
  logo: Logo;
  address: {
    _id: string;
    city: string;
    country: string;
    location: string;
  };
  description: string;
  imageUrl: string;
  primaryCategoryId: string;
}

declare interface FeedItemResponse {
  data: FeedItem[];
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
  slug: string;
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

// ------------------------------------------------------

declare interface Address {
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

declare interface Product {
  _id: string;
  name: string;
  description: string;
  images: ImageItem[];
  price: Price;
  businessId: {
    _id: string;
  };
}

declare interface OpeningHrs {
  days: string;
  open: string;
  close: string;
  isHoliday: boolean;
}

interface PickUpLocation {
  address: string;
  isAlwasyOpen: boolean;
  openingHrs: OpeningHrs[];
}

declare interface DeliveryArea {
  area: string;
  price: string;
  pickUpLocation: PickUpLocation[];
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
  groupTypesId: Attributes[];
  accessibilitiesId: Attributes[];
  primaryCategoryId: string;
  bussCategoriesId: string[];
  bussSubCategoriesId: string[];
  openingHrs: OpeningHrs[];
  isAlwaysOpen: boolean;
  slug: string;
  impact: number;
  socialMedia: any[];
  logo: LogoCover;
  cover: LogoCover;
  countryCode: string | null;
  products: Product[];
  deliveryArea: DeliveryArea[];
  deliverySpecificSellerInfo: string[];
  deliveryReturnExchange: string[];
  deliveryAdditionalInfo: string;
}
