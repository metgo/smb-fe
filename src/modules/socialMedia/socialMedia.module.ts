import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SocialMediaSchema } from './schema/socialMedia.schema';
import { SocialMediaService } from './socialMedia.service';
import { SocialMediaController } from './socialMedia.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SocialMedia', schema: SocialMediaSchema },
    ]),
  ],
  providers: [SocialMediaService],
  controllers: [SocialMediaController],
})
export class SocialMediaModule {}
