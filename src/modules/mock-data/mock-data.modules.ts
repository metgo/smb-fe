import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  MockData,
  MockDataSchema,
} from 'src/modules/mock-data/mock-data.schema';
import { MockDataController } from 'src/modules/mock-data/mock-data.controller';
import { MockDataServices } from 'src/modules/mock-data/mock-data.services';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MockData.name, schema: MockDataSchema },
    ]),
    UsersModule,
  ],
  controllers: [MockDataController],
  providers: [MockDataServices],
})
export class MockDataModule {}
