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
  images: ITripImage[];
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
  totalDistanceCovered: number;
  associatedWebsiteIds: string[];
  contactDetails: {
    name: string;
    phoneNumber: string;
    email: string;
  };
  images: SelectedImage[];
  itenary: ScheduleItem[];
  stations: {
    _id: IStationDetailsProps & { geoLocation: GeoLocation };
  }[];
}

interface ITripPayload {
  // Step 1
  name: string;
  status: TStatus;
  shortDescription: string;
  description: string;
  estimatedDuration: number;
  totalDistanceCovered: number;
  isTrip: boolean;

  dmoId: string;
  authorityId: string;
  associatedWebsiteIds: string[];

  contactDetails: ITripContactDetails;

  // Step 2
  stations: Array<{
    _id: string; // StationId
    order: number;
    type: "businesses" | "poi";
  }>;

  // Step 3
  images: Array<{
    image: string;
    alt: string;
    isPrimary: boolean;
    stationId: string;
  }>;

  // Step 4.
  itenary: Array<{
    title: string;
    startTime: string;
    endTime: string;
  }>;
}

// TripResponse
interface ITripDetailsRes {
  _id: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;

  name: string;
  status: string;
  shortDescription: string;
  description: string;
  contactDetails: ITripContactDetails;
  userId: string;
  authorityId: string;
  dmoId: string;
  associatedWebsiteIds: string[] | null;
  slug: string;
  stations: ITripStation[];
  itenary: ITripItinerary[];
  estimatedDuration: number;
  totalDistanceCovered: number;
  images: Array<ITripImage>;
}

interface ITripImage {
  image: string;
  alt: string;
  isPrimary: boolean;
  stationId: string;
}

interface ITripContactDetails {
  name: string;
  phoneNumber: string;
  email: string;
}

interface ITripStation {
  _id: string;
  name: string;
  shortDescription: string;
  geoLocation: ITripGeoLocation;
  image: string;
  order: number;
  type: string;
}

interface ITripGeoLocation {
  lat: string;
  long: string;
  _id?: string;
}

interface ITripItinerary {
  title: string;
  startTime: string;
  endTime: string;
}
