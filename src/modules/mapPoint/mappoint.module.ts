import { Module } from '@nestjs/common';
import { MapPointController } from './mappoint.controller';
import { MapPointServices } from './mappoint.services';
import { MongooseModule } from '@nestjs/mongoose';
import { MapPointSchema } from './schema/mappoint.schema';
import { MapPointCategoriesSchema } from './schema/mappoint-categories.schema';
import { MapPointSubCategoriesSchema } from './schema/mappoint-sub-categories.schema';
import { MapPointSubCategoriesItemSchema } from './schema/mappoint-sub-categories.item.schema';

@Module({
  imports: [MongooseModule.forFeature([{
    name: 'MapPoint', schema: MapPointSchema,
  },
  { name: 'MapPointCategories', schema: MapPointCategoriesSchema },
  { name: 'MapPointSubCategories', schema: MapPointSubCategoriesSchema },
  { name: 'MapPointSubCategoriesItems', schema: MapPointSubCategoriesItemSchema },
  ])],
  controllers: [MapPointController],
  providers: [MapPointServices],
})
export class MapPointModule { }
