import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DMOModule } from 'src/modules/dmo/dmo.module';
import {
  UsersMockData,
  UsersMockDataSchema,
} from 'src/modules/mock-data/schema/active-users.schema';
import { MockDataController } from 'src/modules/mock-data/mock-data.controller';
import { MockDataServices } from 'src/modules/mock-data/mock-data.services';
import { UsersModule } from 'src/modules/users/users.module';
import {
  StatisticsMockData,
  StatisticsMockDataSchema,
} from 'src/modules/mock-data/schema/impression-engagement.schema';
import { Business, BusinessSchema } from '../business/schema/business.schema';
import { Product, ProductSchema } from '../products/schema/products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersMockData.name, schema: UsersMockDataSchema },
      { name: StatisticsMockData.name, schema: StatisticsMockDataSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    DMOModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [MockDataController],
  providers: [MockDataServices],
  exports: [MockDataServices],
})
export class MockDataModule {}
