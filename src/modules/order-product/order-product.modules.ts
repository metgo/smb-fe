import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { BusinessModule } from 'src/modules/business/business.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { OrderProductController } from 'src/modules/order-product/order-product.controller';
import { OrderProductService } from 'src/modules/order-product/order-product.services';
import {
  OrderProduct,
  OrderProductSchema,
} from 'src/modules/order-product/schema/order-product.schema';
import { OrdersModule } from 'src/modules/orders/orders.modules';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { ConfigModule } from 'src/services/config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrderProduct.name, schema: OrderProductSchema },
    ]),
    forwardRef(() => AuthorityModule),
    BusinessModule,
    forwardRef(() => DMOModule),
    ProductsModule,
    ConfigModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [OrderProductController],
  providers: [OrderProductService],
  exports: [OrderProductService],
})
export class OrderProductModule {}
