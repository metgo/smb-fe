import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { BusinessModule } from 'src/modules/business/business.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { OrdersController } from 'src/modules/orders/orders.controller';
import { Order, OrderSchema } from 'src/modules/orders/schema/orders.schema';
import { OrdersService } from 'src/modules/orders/orders.services';
import { OrderProductModule } from 'src/modules/order-product/order-product.modules';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { CartModule } from 'src/modules/cart/cart.modules';
import { ConfigModule } from 'src/services/config/config.module';
import { PaymentsModule } from 'src/services/payments/payments.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { QRCodeModule } from 'src/services/qr-code/qr-code.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    forwardRef(() => AuthorityModule),
    BusinessModule,
    forwardRef(() => ExternalApiModule),
    forwardRef(() => PaymentsModule),
    ProductsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => VoucherModule),
    ConfigModule,
    forwardRef(() => DMOModule),
    MailChimpModule,
    OrderProductModule,
    CartModule,
    QRCodeModule,
    forwardRef(() => CampaignModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
