import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MapPointController } from './mappoint.controller';
import { MapPointServices } from './mappoint.services';
import { MapPointSchema } from './schema/mappoint.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'MapPoint',
        schema: MapPointSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [MapPointController],
  providers: [MapPointServices],
})
export class MapPointModule {}
