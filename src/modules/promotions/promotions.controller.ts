import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { ServerSuccess } from 'src/common/constant';

import { Locale, PromotionPlacementType } from 'src/common/enum';
import { GetPromotionsByIdentifierIdQuery } from './queries/get-promotions-by-identifier-id.handler.query';

@Controller('promotions')
export class PromotionsController {
  constructor(
    private readonly queryBus: QueryBus,
  ) { }

  // ─── Promotions ────────────────────────────────────────────────────────────
  @ApiEndpoint({
    tags: ['Promotions'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.PROMOTION_GROUP.LISTED,
    },
    params: [{ name: 'identifierId', type: 'string', required: true }],
    operation: 'Get promotion group by Identifier Id',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':identifierId')
  async getPromotionsByIdentifierId(
    @Param('identifierId') identifierId: string,
    @Query('locale') locale?: Locale,
    @Query('placement') placment?: PromotionPlacementType,
  ) {
    return this.queryBus.execute(
      new GetPromotionsByIdentifierIdQuery(identifierId, locale, placment),
    );
  }
}
