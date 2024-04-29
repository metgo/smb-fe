import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
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
    AuthorityModule,
    UsersModule,
    DMOModule,
  ],
  controllers: [MapPointController],
  providers: [MapPointServices],
})
export class MapPointModule {}
