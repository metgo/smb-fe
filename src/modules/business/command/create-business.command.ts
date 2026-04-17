import { CreateBusinessRequest } from '../shared/request/create-business.request';

export class CreateBusinessCommand {
  constructor(public readonly body: CreateBusinessRequest) {}
}
