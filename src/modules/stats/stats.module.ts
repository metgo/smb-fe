import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessModule } from '../business/business.module';
import { Business, BusinessSchema } from '../business/schema/business.schema';
import { DMOModule } from '../dmo/dmo.module';
import { ProductsModule } from '../products/products.module';
import { Product, ProductSchema } from '../products/schema/products.schema';
import { UsersModule } from '../users/users.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Business.name,
        schema: BusinessSchema,
      },
      {
        name: Product.name,
        schema: ProductSchema,
      },
    ]),
    forwardRef(() => UsersModule),
    BusinessModule,
    ProductsModule,
    DMOModule,
  ],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}
