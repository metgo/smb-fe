import { Module } from '@nestjs/common';
import { MapPointController } from './mappoint.controller';
import { MapPointServices } from './mappoint.services';
import { MongooseModule } from '@nestjs/mongoose';
import { MapPointSchema } from './schema/mappoint.schema';
import { MapPointCategoriesSchema } from './schema/mappoint-categoires.schema';

@Module({
  imports: [MongooseModule.forFeature([{
    name: 'MapPoint', schema: MapPointSchema,
  }, { name: 'MapPointCategoires', schema: MapPointCategoriesSchema },
  ])],
  controllers: [MapPointController],
  providers: [MapPointServices],
})
export class MapPointModule { }
