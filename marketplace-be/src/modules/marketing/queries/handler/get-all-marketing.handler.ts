import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetAllMarketingQuery } from '../get-all-marketing.query';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';

@QueryHandler(GetAllMarketingQuery)
export class GetAllMarketingHandler
implements IQueryHandler<GetAllMarketingQuery> {
  constructor(private readonly externalApiService: ExternalApiServices) {}

  async execute(query: GetAllMarketingQuery): Promise<any> {
    try {
      const data
        = await this.externalApiService.findByIdentifierIdAndPopulateMarketing(
          query.request.identifierId,
        );
      return data.marketingIds.map(marketing => ({
        _id: marketing._id,
        images: {
          items: marketing.images?.items?.filter(item => item.isActive),
          timeInterval: marketing.images.timeInterval,
          playType: marketing.images.playType,
        },
      }));
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
