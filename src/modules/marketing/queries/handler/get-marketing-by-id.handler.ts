import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetMarketingByIdQuery } from '../get-marketing-by-id.query';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';

@QueryHandler(GetMarketingByIdQuery)
export class GetMarketingByIdHandler
implements IQueryHandler<GetMarketingByIdQuery> {
  constructor(private readonly externalApiService: ExternalApiServices) {}

  async execute(query: GetMarketingByIdQuery): Promise<any> {
    try {
      const externalApiDetail
        = await this.externalApiService.findByIdentifierIdAndPopulateMarketing(
          query.request.identifierId,
        );

      const marketingDetails = externalApiDetail.marketingIds.find(
        marketing => marketing._id.toString() === query.id.toString(),
      );

      if (!marketingDetails) {
        throw new NotFoundException('Marketing not found');
      }
      return marketingDetails;
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
