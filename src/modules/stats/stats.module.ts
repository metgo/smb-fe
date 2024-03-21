import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Business, BusinessSchema } from '../business/schema/business.schema';
import { DMOModule } from '../dmo/dmo.module';
import { Product, ProductSchema } from '../products/schema/products.schema';
import { UsersModule } from '../users/users.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import {
  CampaignSegment,
  CampaignSegmentSchema,
} from 'src/modules/campaign-segments/schema/campaignSegment.schema';
import { Order, OrderSchema } from 'src/modules/orders/schema/orders.schema';
import {
  Voucher,
  VoucherSchema,
} from 'src/modules/vouchers/schema/voucher.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Business.name,
        schema: BusinessSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: CampaignSegment.name,
        schema: CampaignSegmentSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: Voucher.name,
        schema: VoucherSchema,
      },
    ]),
    forwardRef(() => UsersModule),
    DMOModule,
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
