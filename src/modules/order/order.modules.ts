import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrderController } from 'src/modules/order/order.controller';
import { OrderSchema } from 'src/modules/order/schema/order.schema';
import { OrderService } from 'src/modules/order/order.services';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
    ]),
    UsersModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})

export class OrderModule {}
