import { GetAllAccessibilityRequest } from '../request/get-all-accessibility.request';

export class GetAllAccessibilityQuery {
  constructor(public readonly body: GetAllAccessibilityRequest) {}
}
