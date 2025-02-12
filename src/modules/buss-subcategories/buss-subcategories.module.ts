import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { BussSubCategoriesController } from 'src/modules/buss-subcategories/buss-subcategories.controller';
import { BussSubCategorySchema } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { BussSubCategoriesService } from 'src/modules/buss-subcategories/buss-subcategories.service';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { UsersModule } from 'src/modules/users/users.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BussSubCategory', schema: BussSubCategorySchema },
    ]),
    AuthorityModule,
    DMOModule,
    ExternalApiModule,
    UsersModule,
    CampaignModule,
  ],
  controllers: [BussSubCategoriesController],
  providers: [BussSubCategoriesService],
  exports: [BussSubCategoriesService],
})
export class BussSubCategoriesModule {}
