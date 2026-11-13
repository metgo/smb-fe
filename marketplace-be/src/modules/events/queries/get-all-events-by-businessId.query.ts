import { GetAllEventsBusinessIdRequest } from '../requests/get-all-events-businessId.request';

export class GetAllEventsByBusinessIdQuery {
  constructor(public readonly query?: GetAllEventsBusinessIdRequest) {}
}
