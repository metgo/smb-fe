import { GetAllEventsRequest } from '../requests/get-all-events.request';

export class GetAllEventsQuery {
  constructor(public readonly query: GetAllEventsRequest) {}
}
