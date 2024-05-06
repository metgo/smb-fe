import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { BusinessModule } from 'src/modules/business/business.module';
import { BusinessSchema } from 'src/modules/business/schema/business.schema';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { MockDataModule } from 'src/modules/mock-data/mock-data.modules';
import {
  Product,
  ProductSchema,
} from 'src/modules/products/schema/products.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { ProductsController } from 'src/modules/products/products.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { MediaModule } from 'src/modules/media/media.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      { name: 'Business', schema: BusinessSchema },
    ]),
    forwardRef(() => AuthorityModule),
    forwardRef(() => MockDataModule),
    forwardRef(() => BusinessModule),
    forwardRef(() => DMOModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MediaModule),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
