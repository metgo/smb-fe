import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SocialMediaSchema } from './schema/socialMedia.schema';
import { SocialMediaService } from './socialMedia.service';
import { SocialMediaController } from './socialMedia.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SocialMedia', schema: SocialMediaSchema },
    ]),
    UsersModule,
  ],
  providers: [SocialMediaService],
  controllers: [SocialMediaController],
})
export class SocialMediaModule {}
