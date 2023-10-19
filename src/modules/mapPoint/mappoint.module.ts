import { Module } from '@nestjs/common';
import { MapPointController } from './mappoint.controller';
import { MapPointServices } from './mappoint.services';
import { MongooseModule } from '@nestjs/mongoose';
import { MapPointSchema } from './schema/mappoint.schema';

@Module({
  imports: [MongooseModule.forFeature([{
    name: 'MapPoint', schema: MapPointSchema,
  },
  ])],
  controllers: [MapPointController],
  providers: [MapPointServices],
})
export class MapPointModule { }
