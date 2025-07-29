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

declare interface TrailStation {
  _id: string;
  name: string;
  description: string;
  geoLocaton: Geolocation;
  bussSubCategoriesId: Attributes[];
  bussCategoriesId: Attributes[];
  groupTypesId: Attributes[];
  accessibilitiesId: Attributes[];
  images: ImageItem[];
  primaryCategoryId: Attributes;
  logo: ImageItem;
}

declare interface TrailDetails {
  _id: string;
  name: string;
  description: string;
  stations: TrailStation[];
}

declare interface TrailStationRoute {
  _id: string;
  name: string;
  slug: string;
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
