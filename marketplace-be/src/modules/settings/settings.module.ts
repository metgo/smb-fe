import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import {
  ExternalApi,
  ExternalApiSchema,
} from 'src/modules/external-api/schema/external-api.schema';
import {
  Setting,
  SettingSchema,
} from 'src/modules/settings/schema/settings.schema';
import { SettingsController } from 'src/modules/settings/settings.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { GetSettingByIdentifierIdHandler } from './queries/handler/get-setting-by-identifier-id.handler';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Setting.name, schema: SettingSchema },
      { name: ExternalApi.name, schema: ExternalApiSchema },
    ]),
    AuthorityModule,
    UsersModule,
    DMOModule,
  ],
  providers: [GetSettingByIdentifierIdHandler],
  controllers: [SettingsController],
})
export class SettingsModule {}
