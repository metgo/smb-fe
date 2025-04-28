import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { BussCategoriesController } from './buss-categories.controller';
import { BussCategoriesService } from './buss-categories.service';
import {
  BussCategory,
  BussCategorySchema,
} from './schema/buss.category.schema';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { UsersModule } from '../users/users.module';
import { BussSubCategoriesModule } from '../buss-subcategories/buss-subcategories.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { ConfigModule } from 'src/services/config/config.module';
import { Product, ProductSchema } from '../products/schema/products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AuthorityModule,
    BussSubCategoriesModule,
    ConfigModule,
    ExternalApiModule,
    DMOModule,
    UsersModule,
    CampaignModule,
  ],

  controllers: [BussCategoriesController],
  providers: [BussCategoriesService],
})
export class BussCategoriesModule {}
