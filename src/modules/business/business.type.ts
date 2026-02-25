import { Locale } from 'src/common/enum';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';

// eslint-disable-next-line no-shadow
export enum BusinessStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  DRAFT = 'DRAFT',
}

export interface GetBusinessByIdOrSlug {
  id: string;
  loggedInUser?: LoggedInUserInterface;
  locale?: Locale;
}

// eslint-disable-next-line no-shadow
export enum GeoServicesTypes {
  BUSINESS = 'business',
  POINT_OF_INTEREST = 'point_of_interest',
}
