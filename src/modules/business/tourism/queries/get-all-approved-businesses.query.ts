import { GetAllApprovedBusinessesRequest } from 'src/modules/business/tourism/request/get-all-approved-businesses.request';

export class GetAllApprovedBusinessesQuery {
  constructor(public readonly query: GetAllApprovedBusinessesRequest) {}
}
