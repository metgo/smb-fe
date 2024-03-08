import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BussCategoriesController } from './buss-categories.controller';
import { BussCategoriesService } from './buss-categories.service';
import {
  BussCategory,
  BussCategorySchema,
} from './schema/buss.category.schema';
import { UsersModule } from '../users/users.module';
import { BussSubCategoriesModule } from '../buss-subcategories/buss-subcategories.module';
import {
  BussSubCategory,
  BussSubCategorySchema,
} from '../buss-subcategories/schema/buss-subCategory.schema';
import { ConfigModule } from 'src/services/config/config.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BussCategory.name, schema: BussCategorySchema },
      { name: BussSubCategory.name, schema: BussSubCategorySchema },
    ]),
    UsersModule,
    BussSubCategoriesModule,
    ConfigModule,
  ],

  controllers: [BussCategoriesController],
  providers: [BussCategoriesService],
})
export class BussCategoriesModule {}
