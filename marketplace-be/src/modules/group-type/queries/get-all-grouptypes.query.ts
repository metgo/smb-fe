import { GetAllGroupTypesRequest } from '../request/get-all-grouptype.request';

export class GetAllGroupTypesQuery {
  constructor(public readonly body: GetAllGroupTypesRequest) {}
}
