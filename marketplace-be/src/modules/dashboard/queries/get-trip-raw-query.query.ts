import { ServicesTypes } from '../dashboard.type';

export interface GetTripRawQueryDto {
  serviceType?: ServicesTypes[];
  campDetails?: any;
}

export class GetTripRawQuery {
  constructor(readonly body: GetTripRawQueryDto) {}
}
