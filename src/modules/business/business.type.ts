// eslint-disable-next-line no-shadow
export enum BusinessStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export interface GetBusinessByIdOrSlug {
  id: string;
  loggedInUser: any;
}

// eslint-disable-next-line no-shadow
export enum GeoServicesTypes {
  BUSINESS = 'business',
  EVENT = 'event',
  MAP_POINT = 'mappoint',
}
