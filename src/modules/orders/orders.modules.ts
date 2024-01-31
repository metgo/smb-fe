import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessModule } from 'src/modules/business/business.module';
import { OrdersController } from 'src/modules/orders/orders.controller';
import { Order, OrderSchema } from 'src/modules/orders/schema/orders.schema';
import { OrdersService } from 'src/modules/orders/orders.services';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { ConfigModule } from 'src/services/config/config.module';
import { PaymentsModule } from 'src/services/payments/payments.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
    BusinessModule,
    PaymentsModule,
    ProductsModule,
    UsersModule,
    VoucherModule,
    ConfigModule,
    MailChimpModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})

export class OrdersModule {}
