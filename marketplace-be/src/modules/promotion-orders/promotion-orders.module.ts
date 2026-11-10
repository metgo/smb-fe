import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessModule } from 'src/modules/business/business.module';
import { DocUploadModule } from 'src/modules/doc-upload/doc-upload.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { VoucherSchema } from 'src/modules/vouchers/schema/voucher.schema';
import { PromotionOrdersController } from './promotion-orders.controller';
import { PromotionOrdersGateway } from './promotion-orders.gateway';
import { PromotionOrdersService } from './promotion-orders.service';
import { PromotionOrder, PromotionOrderSchema } from './schema/promotion-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromotionOrder.name, schema: PromotionOrderSchema },
      { name: 'Voucher', schema: VoucherSchema },
    ]),
    MailChimpModule,
    DocUploadModule,
    forwardRef(() => BusinessModule),
  ],
  controllers: [PromotionOrdersController],
  providers: [PromotionOrdersService, PromotionOrdersGateway],
  exports: [PromotionOrdersService],
})
export class PromotionOrdersModule {}
