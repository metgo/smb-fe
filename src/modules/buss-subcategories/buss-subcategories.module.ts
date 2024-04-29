import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { BussSubCategoriesController } from './buss-subcategories.controller';
import { BussSubCategorySchema } from './schema/buss-subCategory.schema';
import { BussSubCategoriesService } from './buss-subcategories.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BussSubCategory', schema: BussSubCategorySchema },
    ]),
    AuthorityModule,
    DMOModule,
    UsersModule,
  ],
  controllers: [BussSubCategoriesController],
  providers: [BussSubCategoriesService],
  exports: [BussSubCategoriesService],
})
export class BussSubCategoriesModule {}
