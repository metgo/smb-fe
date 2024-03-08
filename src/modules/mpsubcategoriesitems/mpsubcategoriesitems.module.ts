import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MPSubCategoriesItemsSchema } from './schema/subcategoriesitems.schema';
import { MPSubCategoriesItemsService } from './mpsubcategoriesitems.service';
import { MPSubCategoriesItemsController } from './mpsubcategoriesitems.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'MPSubCategoriesItems', schema: MPSubCategoriesItemsSchema },
    ]),
  ],
  providers: [MPSubCategoriesItemsService],
  controllers: [MPSubCategoriesItemsController],
})
export class MPSubCategoriesItemsModule {}
