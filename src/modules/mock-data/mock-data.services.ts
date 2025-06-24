import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { CreateImpressionEngagementInterface } from 'src/modules/mock-data/interface/create-statistics.interface';
import { GetMockDataQuery } from 'src/modules/mock-data/queries/get-mock-data.query';
import { UsersMockData } from 'src/modules/mock-data/schema/active-users.schema';
import { StatisticsMockData } from 'src/modules/mock-data/schema/impression-engagement.schema';
import { Business } from '../business/shared/schema/business.schema';
import { Product } from '../products/schema/products.schema';

@Injectable()
export class MockDataServices {
  constructor(
    @InjectModel(UsersMockData.name)
    private UsersMockDataModel: Model<UsersMockData>,
    @InjectModel(StatisticsMockData.name)
    private StatisticsMockDataModel: Model<StatisticsMockData>,
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
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

      await this.UsersMockDataModel.create(mockData);
    });
  }

  async seedStatsMock() {
    const businesses = await this.BusinessModel.find();
    const products = await this.ProductModel.find();

    await Promise.all(
      businesses.map(async buss => {
        const impression = Math.floor(Math.random() * (200 - 150 + 1)) + 150;
        const engagement = Math.floor(Math.random() * (200 - 150 + 1)) + 150;
        const mockData = {
          businessId: buss.id,
          productId: null,
          impression,
          engagement,
        };

        await this.StatisticsMockDataModel.create(mockData);
      }),
    );

    await Promise.all(
      products.map(async buss => {
        const impression = Math.floor(Math.random() * (200 - 150 + 1)) + 150;
        const engagement = Math.floor(Math.random() * (200 - 150 + 1)) + 150;
        const mockData = {
          businessId: null,
          productId: buss.id,
          impression,
          engagement,
        };

        await this.StatisticsMockDataModel.create(mockData);
      }),
    );
  }

  async createImpressionEngagementInterface(
    command: CreateImpressionEngagementInterface,
  ) {
    const impression = Math.floor(Math.random() * (200 - 150 + 1)) + 150;
    const engagement = Math.floor(Math.random() * (200 - 150 + 1)) + 150;

    const newStats = new this.StatisticsMockDataModel({
      ...command,
      impression,
      engagement,
      createdAt: new Date(),
    });
    await newStats.save();
  }

  async getAllData(queries: GetMockDataQuery) {
    try {
      const { startDate, endDate, ...query } = queries;

      let findQuery: any = { ...query };
      if (startDate && endDate) {
        const createdStartDate = new Date(startDate);
        const createdEndDate = new Date(endDate);
        createdEndDate.setDate(createdEndDate.getDate() + 1);

        if (createdStartDate >= createdEndDate) {
          throw new BadRequestException(
            `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
          );
        }

        findQuery = {
          ...findQuery,
          createdAt: {
            $gte: createdStartDate,
            $lt: createdEndDate,
          },
        };
      }

      const select
        = '-updatedAt -createdBy -updatedBy -deletedBy -deletedAt  -__v -isDeleted';

      const mockdata = await queryhandler<UsersMockData>(
        this.UsersMockDataModel,
        {
          findQuery,
          select,
        },
      );

      return mockdata;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getStatisticsByBussOrProId(id: string) {
    const stats = await this.StatisticsMockDataModel.findOne({
      $or: [{ businessId: id }, { productId: id }],
    }).select(disSelect);

    return stats;
  }
}
