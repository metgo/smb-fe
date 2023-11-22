import { Module } from '@nestjs/common';
import { BussSubCategoriesController } from './buss-subcategories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BussSubCategorySchema } from './schema/buss-subCategory.schema';
import { BussSubCategoriesService } from './buss-subcategories.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BussSubCategory', schema: BussSubCategorySchema },
    ]),
    UsersModule,
  ],
  controllers: [BussSubCategoriesController],
  providers: [BussSubCategoriesService],
})
export class BussSubCategoriesModule {}
