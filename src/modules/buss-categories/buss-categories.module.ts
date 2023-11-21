import { Module } from '@nestjs/common';
import { BussCategoriesController } from './buss-categories.controller';
import { BussCategoriesService } from './buss-categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BussCategorySchema } from './schema/buss.category.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'BussCategory', schema: BussCategorySchema },
    ]),
    UsersModule,
  ],

  controllers: [BussCategoriesController],
  providers: [BussCategoriesService],
})
export class BussCategoriesModule {}
