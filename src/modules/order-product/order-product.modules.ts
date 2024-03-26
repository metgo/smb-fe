import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessModule } from 'src/modules/business/business.module';
import { OrderProductService } from 'src/modules/order-product/order-product.services';
import { OrderProduct, OrderProductSchema } from 'src/modules/order-product/schema/order-product.schema';
import { OrdersModule } from 'src/modules/orders/orders.modules';
import { ProductsModule } from 'src/modules/products/products.module';
import { ConfigModule } from 'src/services/config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OrderProduct.name, schema: OrderProductSchema }]),
    BusinessModule,
    ProductsModule,
    ConfigModule,
    forwardRef(() => OrdersModule),
  ],
  providers: [OrderProductService],
  exports: [OrderProductService],
})
export class OrderProductModule {}
