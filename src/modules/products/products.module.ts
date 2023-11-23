import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'src/modules/auth/auth.module';
import { BusinessModule } from 'src/modules/business/business.module';
import { Product, ProductSchema } from 'src/modules/products/schema/products.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { ProductsController } from 'src/modules/products/products.controller';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Product.name, schema: ProductSchema,
    }]),
    AuthModule,
    BusinessModule,
    UsersModule,
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})

export class ProductsModule {}
