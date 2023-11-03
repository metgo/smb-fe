import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IconsController } from './icons.controller';
import { IconsService } from './icons.service';
import { IconsSchema } from './schema/icon.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Icons', schema: IconsSchema },
  ])],
  controllers: [IconsController],
  providers: [IconsService],
})
export class IconsModule {}
