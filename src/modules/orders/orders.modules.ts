import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrderController } from 'src/modules/orders/orders.controller';
import { OrderSchema } from 'src/modules/orders/schema/orders.schema';
import { OrderService } from 'src/modules/orders/orders.services';
import { UsersModule } from 'src/modules/users/users.module';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
    ]),
    UsersModule,
    VoucherModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})

export class OrderModule {}
