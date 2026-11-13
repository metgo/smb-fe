import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PromotionsService } from '../../promotions.service';
import { GetPromotionsByIdentifierIdQuery } from '../get-promotions-by-identifier-id.handler.query';

@QueryHandler(GetPromotionsByIdentifierIdQuery)
export class GetPromotionsByIdentifierIdHandler
implements IQueryHandler<GetPromotionsByIdentifierIdQuery> {
  constructor(private readonly promotionsService: PromotionsService) {}

  async execute(query: GetPromotionsByIdentifierIdQuery) {
    return this.promotionsService.getPromotionsByIdentifierId(
      query.identifierId,
      query.locale,
      query.placement,
    );
  }
}
