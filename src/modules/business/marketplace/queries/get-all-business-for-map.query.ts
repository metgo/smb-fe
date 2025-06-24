import { GetAllBusinessesForMapRequest } from '../../shared/request/get-all-business-for-map.request';

export class GetAllBusinessForMapQuery {
  constructor(public readonly query: GetAllBusinessesForMapRequest) {}
}
