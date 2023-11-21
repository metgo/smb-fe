import { Module } from '@nestjs/common';
import { BussCategoriesController } from './buss-categories.controller';
import { BussCategoriesService } from './buss-categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BussCategorySchema } from './schema/buss.category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BussCategory', schema: BussCategorySchema },
    ]),
  ],
  controllers: [BussCategoriesController],
  providers: [BussCategoriesService],
})
export class BussCategoriesModule {}
