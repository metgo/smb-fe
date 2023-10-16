import { Module } from '@nestjs/common';
import { MapPointController } from './mappoint.controller';
import { MapPointServices } from './mappoint.services';
import { MongooseModule } from '@nestjs/mongoose';
import { MapPointSchema } from './schema/mappoint.schema';
import { MapPointCategoriesSchema } from './schema/mappoint-categoires.schema';
import { MapPointSubCategoriesSchema } from './schema/mappoint-sub-categoires.schema';
import { MapPointSubCategoiresItemSchema } from './schema/mappoint-sub-categories.item.schema';

@Module({
  imports: [MongooseModule.forFeature([{
    name: 'MapPoint', schema: MapPointSchema,
  },
  { name: 'MapPointCategoires', schema: MapPointCategoriesSchema },
  { name: 'MapPointSubCategoires', schema: MapPointSubCategoriesSchema },
  { name: 'MapPointSubCategoiresItems', schema: MapPointSubCategoiresItemSchema },
  ])],
  controllers: [MapPointController],
  providers: [MapPointServices],
})
export class MapPointModule { }
