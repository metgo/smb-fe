import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MPCategoriesSchema } from './schema/categories.schema';
import { MPCategoiresService } from './mpcategories.service';
import { MPCategoriesController } from './mpcategories.controller';

@Module({
  imports: [MongooseModule.forFeature([{
    name: 'MPCategories', schema: MPCategoriesSchema,
  },
  ])],
  providers: [MPCategoiresService],
  controllers: [MPCategoriesController],
})
export class MPCategoriesModule {

}
