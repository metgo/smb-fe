import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';
import { IconsSchema } from './schema/icon.schema';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Icons', schema: IconsSchema }]),
    AuthorityModule,
    DMOModule,
    UsersModule,
  ],
  controllers: [IconsController],
  providers: [IconsService],
  exports: [IconsService],
})
export class IconsModule {}
