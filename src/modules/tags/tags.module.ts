import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GenerateTagsHandler } from './command/handler/generate-tags.handler';
import { TagsController } from './controllers/tags.controllers';
import { ConfigModule } from 'src/services/config/config.module';
import { TagsSchema } from './schema/tags.schema';
import { CreateTagHandler } from './command/handler/create-tags.handler';
import { GetAllTagsHandler } from './queries/handler/get-all-tags.handler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tags', schema: TagsSchema }]),
    ConfigModule,
  ],
  controllers: [TagsController],
  providers: [GenerateTagsHandler, CreateTagHandler, GetAllTagsHandler],
})
export class TagsModule {}
