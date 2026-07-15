enum TripStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  DRAFT = "DRAFT",
}

interface ITripImage {
  image: string;
  caption: string;
  alt: string;
  isPrimary: boolean;
  stationId: string;
}

interface ITrip {
  _id: string;
  createdAt: string;
  name: string;
  status: TripStatus;
  description: string;
  images: ITripImage[];
  estimatedDuration: number;
  shortDescription: string;
  stations: number;
}

interface ITripsRes extends IMetaData {
  data: ITrip[];
}

interface ImageData {
  image: string;
  caption: string;
  alt: string;
}

interface IClickedStationProps {
  stationId: string;
  geoLocation: GeoLocation;
}

interface IStationDetailsProps {
  _id: string;
  name: string;
  description: string;
  serviceType: string;
  shortDescription: string;
  images: ImageData[];
  logo: ImageData;
  slug: string;
}

interface IAtrribute {
  _id: string;
  name: string;
  hebrewName: string;
}

interface ITripStations {
  _id: string;
  dmoId: string;
  authorityId: string;
  serviceType: string;
  geoLocation: GeoLocation;
  iconPath: string;
}

interface ITripStationsRes extends IMetaData {
  data: ITripStations[];
}

interface ITripStationReq {
  dmoId: string;
  authorityId: string;
}

type TRouteResponse = {
  routes?: Array<{
    polyline?: {
      encodedPolyline?: string;
    };
  }>;
};

interface ScheduleItem {
  title: string;
  startTime: string | null;
  endTime: string | null;
}

interface SelectedImage {
  image: string;
  caption: string;
  alt: string;
  isPrimary: boolean;
  stationId?: string;
}

interface ITripDetails {
  _id: string;
  name: string;
  status: string;
  description: string;
  shortDescription: string;
  estimatedDuration: number;
  images: SelectedImage[];
  itenary: ScheduleItem[];
  stations: {
    _id: IStationDetailsProps & { geoLocation: GeoLocation };
  }[];
}
