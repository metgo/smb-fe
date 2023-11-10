import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessModule } from 'src/modules/business/business.module';
import { BusinessMediaController } from 'src/modules/business-media/business-media.controller';
import { Media, MediaSchema } from 'src/modules/business-media/schema/media.schema';
import { BusinessMediaServices } from 'src/modules/business-media/business-media.service';
import { UsersModule } from 'src/modules/users/users.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Media.name, schema: MediaSchema },
    ]),
    GcpBucketModule,
    BusinessModule,
    UsersModule,
  ],
  controllers: [BusinessMediaController],
  providers: [BusinessMediaServices],
  exports: [BusinessMediaServices],
})
export class BusinessMediaModule {}
