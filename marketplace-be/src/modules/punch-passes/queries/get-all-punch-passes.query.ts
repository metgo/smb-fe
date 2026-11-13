import { GetAllPunchPassesRequest } from '../request/get-all-punch-passes.request';

export class GetAllPunchPassesQuery {
  constructor(public readonly body: GetAllPunchPassesRequest) {}
}
