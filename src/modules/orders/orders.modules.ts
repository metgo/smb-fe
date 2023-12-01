import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrdersController } from 'src/modules/orders/orders.controller';
import { Order, OrderSchema } from 'src/modules/orders/schema/orders.schema';
import { OrdersService } from 'src/modules/orders/orders.services';
import { PaymentsModule } from 'src/services/payments/payments.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
    ]),
    PaymentsModule,
    ProductsModule,
    UsersModule,
    VoucherModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})

export class OrdersModule {}
