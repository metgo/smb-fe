import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BusinessModule } from 'src/modules/business/business.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { MediaController } from 'src/modules/media/media.controller';
import { Media, MediaSchema } from 'src/modules/media/schema/media.schema';
import { MediaServices } from 'src/modules/media/media.service';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
    GcpBucketModule,
    BusinessModule,
    DMOModule,
    ProductsModule,
    UsersModule,
  ],
  controllers: [MediaController],
  providers: [MediaServices],
  exports: [MediaServices],
})
export class MediaModule {}
