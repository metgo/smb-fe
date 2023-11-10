import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';
import { IconsSchema } from './schema/icon.schema';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Icons', schema: IconsSchema },
    ]),
    GcpBucketModule,
  ],
  controllers: [IconsController],
  providers: [IconsService],
  exports: [IconsService],
})
export class IconsModule {}
