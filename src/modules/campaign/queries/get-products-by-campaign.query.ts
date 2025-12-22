import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { GetProductsByCampaignRequest } from '../requests/get-products-by-campaign.request';

export class GetProductsByCampaignQuery {
  constructor(
    public readonly campCode: string,
    public readonly queryData: GetProductsByCampaignRequest,
    public readonly loggedInUser?: LoggedInUserInterface,
  ) {}
}
