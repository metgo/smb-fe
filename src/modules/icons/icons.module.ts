import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DMOModule } from 'src/modules/dmo/dmo.module';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';
import { IconsSchema } from './schema/icon.schema';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Icons', schema: IconsSchema }]),
    DMOModule,
    GcpBucketModule,
    UsersModule,
  ],
  controllers: [IconsController],
  providers: [IconsService],
  exports: [IconsService],
})
export class IconsModule {}
