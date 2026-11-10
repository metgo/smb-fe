import { GetAllTicketsRequest } from '../requests/get-all-tickets.request';

export class GetAllTicketsQuery {
  constructor(public readonly request: GetAllTicketsRequest) {}
}
