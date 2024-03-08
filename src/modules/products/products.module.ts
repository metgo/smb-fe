import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessModule } from 'src/modules/business/business.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import {
  Product,
  ProductSchema,
} from 'src/modules/products/schema/products.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { ProductsController } from 'src/modules/products/products.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
    BusinessModule,
    DMOModule,
    forwardRef(() => UsersModule),
    GcpBucketModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
