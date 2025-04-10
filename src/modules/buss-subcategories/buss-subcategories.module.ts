import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { BussSubCategoriesController } from 'src/modules/buss-subcategories/buss-subcategories.controller';
import { BussSubCategorySchema } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { BussSubCategoriesService } from 'src/modules/buss-subcategories/buss-subcategories.service';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { UsersModule } from 'src/modules/users/users.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { GetAllSubCategoriesHandler } from './queries/handler/get-all-subcategories.handler';
import { Product } from '../products/schema/products.schema';
import { Business } from '../business/schema/business.schema';
import { Authority } from '../authority/schema/authority.schema';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: 'BussSubCategory', schema: BussSubCategorySchema },
      { name: Product.name, schema: Product },
      { name: Business.name, schema: Business },
      { name: Authority.name, schema: Authority },
    ]),
    AuthorityModule,
    DMOModule,
    ExternalApiModule,
    UsersModule,
    CampaignModule,
  ],
  controllers: [BussSubCategoriesController],
  providers: [BussSubCategoriesService, GetAllSubCategoriesHandler],
  exports: [BussSubCategoriesService],
})
export class BussSubCategoriesModule {}
