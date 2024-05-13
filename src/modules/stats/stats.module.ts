import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
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
import {
  OrderProduct,
  OrderProductSchema,
} from '../order-product/schema/order-product.schema';

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
        name: OrderProduct.name,
        schema: OrderProductSchema,
      },
      {
        name: Voucher.name,
        schema: VoucherSchema,
      },
    ]),
    AuthorityModule,
    forwardRef(() => UsersModule),
    DMOModule,
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
