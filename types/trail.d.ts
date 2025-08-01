declare interface TrailFeed {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: ImageItem[];
  address: {
    country: string;
    location: string;
  };
}

declare type TrailFeedList = TrailFeed[];

declare interface TrailsFeedProps {
  data: TrailList;
  totalData: number;
  meta: paginationMeta;
}

declare interface TrailStationProps {
  _id: string;
  name: string;
  description: string;
  geoLocation: GeoLocation;
  bussSubCategoriesId: Attributes[];
  bussCategoriesId: Attributes[];
  images: ImageItem[];
  primaryCategoryId: Attributes;
  logo: ImageItem;
  order: number;
  type: string;
}

declare type TrailStationListProps = TrailStationProps[];

declare interface TrailDetailsProps {
  _id: string;
  name: string;
  description: string;
  stations: TrailStationProps[];
  groupTypesId: Attributes[];
  accessibilitiesId: Attributes[];
}

declare interface TrailDetailsRouteProps {
  _id: string;
  name: string;
  description: string;
  stations: TrailStationProps[];
  locations: LocationListProps;
}

declare interface TrailStationRouteProps {
  _id: string;
  name: string;
  description: string;
  stations: {
    _id: string;
    name: string;
    description: string;
    geoLocation: GeoLocation;
    primaryCategoryId: string;
    order: number;
    type: string;
  }[];
}
