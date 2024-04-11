import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DMOModule } from 'src/modules/dmo/dmo.module';
import {
  Setting,
  SettingSchema,
} from 'src/modules/settings/schema/settings.schema';
import { SettingsController } from 'src/modules/settings/settings.controller';
import { SettingsServices } from 'src/modules/settings/settings.services';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Setting.name,
        schema: SettingSchema,
      },
    ]),
    UsersModule,
    DMOModule,
  ],
  providers: [SettingsServices],
  controllers: [SettingsController],
})
export class SettingsModule {}
