import { GetAllTripsRequest } from '../request/get-all-trips.request';

export class GetAllTripsQuery {
  constructor(public readonly query: GetAllTripsRequest) {}
}
