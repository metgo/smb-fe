import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  UsersMockData,
  UsersMockDataSchema,
} from 'src/modules/mock-data/schema/active-users.schema';
import {
  StatisticsMockData,
  StatisticsMockDataSchema,
} from 'src/modules/mock-data/schema/impression-engagement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersMockData.name, schema: UsersMockDataSchema },
      { name: StatisticsMockData.name, schema: StatisticsMockDataSchema },
    ]),
  ],
})
export class MockDataModule {}
