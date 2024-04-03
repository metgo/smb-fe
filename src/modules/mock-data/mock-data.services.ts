import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { disSelect } from 'src/common/utils/select.handling';
import { GetMockDataQuery } from 'src/modules/mock-data/queries/get-mock-data.query';
import { MockData } from 'src/modules/mock-data/mock-data.schema';

@Injectable()
export class MockDataServices {
  constructor(
    @InjectModel(MockData.name)
    private MockDataModel: Model<MockData>,
  ) {}

  async seed() {
    const startDate = new Date('2023-11-01');
    const endDate = new Date('2024-04-01');
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate mock data
    dates.forEach(async createdAt => {
      // for internal
      // const userCount = Math.floor(Math.random() * (50 - 10 + 1)) + 10;
      // const isExternalApi = false;
      // const identifierId = null;

      // for external api
      const userCount = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
      const isExternalApi = true;
      const identifierId = 'TAV8-sderot20@$W3S71W1n';

      const mockData = {
        createdAt,
        userCount,
        isExternalApi,
        identifierId,
      };

      await this.MockDataModel.create(mockData);
    });
  }

  async getAllData(queries: GetMockDataQuery) {
    try {
      const { startDate, endDate, ...query } = queries;

      let findQuery: any = { ...query };
      if (startDate && endDate) {
        const createdStartDate = new Date(startDate);
        const createdEndDate = new Date(endDate);

        if (createdStartDate >= createdEndDate) {
          throw new BadRequestException(
            `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
          );
        }

        findQuery = {
          ...findQuery,
          createdAt: {
            $gte: createdStartDate,
            $lte: createdEndDate,
          },
        };
      }

      const select = `${disSelect}`;

      const mockdata = await queryhandler<MockData>(this.MockDataModel, {
        findQuery,
        select,
      });

      return mockdata;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
