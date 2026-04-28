import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Promotion, PromotionSchema } from './schema/promotion.schema';
import {
  PromotionGroup,
  PromotionGroupSchema,
} from './schema/promotion-group.schema';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';

import { GetPromotionsByIdentifierIdHandler } from './queries/handler/get-promotions-by-identifier-id.handler';
import {
  ExternalApi,
  ExternalApiSchema,
} from '../external-api/schema/external-api.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotion.name, schema: PromotionSchema },
      { name: PromotionGroup.name, schema: PromotionGroupSchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
    ]),
  ],
  providers: [PromotionsService, GetPromotionsByIdentifierIdHandler],
  controllers: [PromotionsController],
  exports: [PromotionsService],
})
export class PromotionsModule {}
