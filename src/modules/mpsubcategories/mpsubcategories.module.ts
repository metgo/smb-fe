import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MPSubCategoriesSchema } from './schema/subcategories.schema';
import { MPSubCategoriesService } from './mpsubcategories.service';
import { MPSubCategoriesController } from './mpsubcategories.controller';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'MPSubCategories', schema: MPSubCategoriesSchema },
  ])],
  providers: [MPSubCategoriesService],
  controllers: [MPSubCategoriesController],
})
export class MPSubCategoriesModule {}
