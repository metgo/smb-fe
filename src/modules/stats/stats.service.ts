/* eslint-disable max-len */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ServerErrors } from 'src/common/constant';
import { LoggedInUserInterface } from '../auth/interface/login.interface';
import { GeoServicesTypes } from '../business/business.type';
import { Business } from '../business/schema/business.schema';
import { DMOService } from '../dmo/dmo.service';
import { Product } from '../products/schema/products.schema';
import { UserType } from '../users/users.type';
import { GetALLBusinessProductStatsquery } from './query/query.dto';
import { subDays, differenceInDays } from 'date-fns';

@Injectable()
export class StatsService {
  constructor(
      @InjectModel('Business')
      private BusinessModel: Model<Business>,
        @InjectModel('Product')
        private ProductModel: Model<Product>,
        private dmoService: DMOService,
  ) { }

  async getBusinessStats(loginUser: LoggedInUserInterface, query: GetALLBusinessProductStatsquery) {
    if (!query.startDate || !query.endDate) {
      throw new BadRequestException(
        'Data is required',
      );
    }
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const daysDifference = differenceInDays(endDate, startDate);
    const dmo = query.dmoId;
    let findQuery: any = {
      serviceType: GeoServicesTypes.BUSINESS,
    };
    if (startDate >= endDate) {
      throw new BadRequestException(
        `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
      );
    }

    if (dmo) {
      findQuery = {
        ...findQuery,
        dmoId: dmo,
      };
    }
    if (loginUser?.role === UserType.TRAVELLER) {
      findQuery = {
        ...findQuery,
        userId: loginUser.id,
      };
    }
    if (loginUser?.role === UserType.DMO) {
      const dmoID = await this.dmoService.findDMOByUserID(loginUser.id);
      findQuery = {
        ...findQuery,
        dmoId: dmoID,
      };
    }
    try {
      const dateFilter = {
        $gte: startDate,
        $lte: endDate,
      };

      // Count deleted businesses for each category in the given range
      const deletedBusinessStats = await this.BusinessModel.aggregate([
        {
          $match: {
            deletedAt: dateFilter,
            ...findQuery,
          },
        },
        {
          $lookup: {
            from: 'BussCategory', // Replace with your category collection name
            localField: 'bussCategoriesId',
            foreignField: '_id', // Replace with appropriate field in Category model
            as: 'category',
          },
        },
        {
          $group: {
            _id: '$bussCategoriesId', // Group by category ID
            count: { $sum: 1 }, // Calculate the number of businesses per category
            category: { $first: '$category' }, // Get the first category object (if using Category model)
          },
        },
      ]);

      // aggregate functions
      const getBusinessStats = async (filter: any) => await this.BusinessModel.aggregate([
        {
          $match: filter,
        },
        {
          $unwind: '$bussCategoriesId', // Unwind bussCategoriesId array
        },
        {
          $lookup: {
            from: 'BussCategory', // Replace with your category collection name
            localField: 'bussCategoriesId',
            foreignField: '_id', // Replace with appropriate field in Category model
            as: 'category',
          },
        },
        {
          $group: {
            _id: '$bussCategoriesId', // Group by category ID
            count: { $sum: 1 }, // Calculate the number of businesses per category
            category: { $first: '$category' }, // Get the first category object (if using Category model)
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id from the result
            categoryId: '$_id', // Rename _id to categoryId
            count: 1,
            category: 1, // Include category details if using Category model
          },
        },
        { $sort: { count: -1 as any } },
      ]);

      // all business statics
      const getAllBusinessStats = await getBusinessStats(
        { ...findQuery },
      );

      // Count businesses for each category in the given date range
      const filteredBusinessStats = await getBusinessStats(
        {
          ...findQuery,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      );
      // Count businesses for each category in the previous date range
      const previousDateFilter = {
        $gte: new Date(subDays(startDate.getTime(), daysDifference)), // 30 days before startDate
        $lt: startDate,
      };
      const previousDateBusinessStats = await getBusinessStats(
        { ...findQuery, createdAt: previousDateFilter },
      );

      // Find the growth or declined rate for each category
      const growthRateStats = getAllBusinessStats.map(category => {
        const categoryId = category?.categoryId.toString();
        const totalCount = category?.count;
        const currentCount = filteredBusinessStats.find(c => c.categoryId.toString() === categoryId)?.count || 0;
        const previousCount = previousDateBusinessStats.find(c => c.categoryId.toString() === categoryId)?.count || 0;
        const deleteCount = deletedBusinessStats.find(c => c.categoryId.toString() === categoryId)?.count || 0;

        const growthRate = ((currentCount - deleteCount) / (previousCount + currentCount)) * 100;

        return {
          categoryId,
          growthRate,
          currentCount,
          previousCount,
          deleteCount,
          totalCount,

        };
      });
      // Your results
      return {
        deletedBusinessStats,
        getAllBusinessStats,
        filteredBusinessStats,
        previousDateBusinessStats,
        growthRateStats,
      };
    } catch (error) {
      // Handle errors
      console.error(error);
      throw error;
    }
  }

  async getProductStats(loginUser: LoggedInUserInterface, query: GetALLBusinessProductStatsquery) {
    if (!query.startDate || !query.endDate) {
      throw new BadRequestException(
        'Data is required',
      );
    }
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const daysDifference = differenceInDays(endDate, startDate);
    const dmo = query.dmoId;
    let findQuery: any = {
      serviceType: GeoServicesTypes.BUSINESS,
    };
    if (startDate >= endDate) {
      throw new BadRequestException(
        `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
      );
    }

    if (dmo) {
      findQuery = {
        ...findQuery,
        dmoId: dmo,
      };
    }
    if (loginUser?.role === UserType.TRAVELLER) {
      findQuery = {
        ...findQuery,
        userId: loginUser.id,
      };
    }
    if (loginUser?.role === UserType.DMO) {
      const dmoID = await this.dmoService.findDMOByUserID(loginUser.id);
      findQuery = {
        ...findQuery,
        dmoId: dmoID,
      };
    }
    try {
      const dateFilter = {
        $gte: startDate,
        $lte: endDate,
      };

      // Count deleted businesses for each category in the given range
      const deletedProductStats = await this.ProductModel.aggregate([
        {
          $match: {
            deletedAt: dateFilter,
            ...findQuery,
          },
        },
        {
          $lookup: {
            from: 'BussCategory', // Replace with your category collection name
            localField: 'bussCategoriesId',
            foreignField: '_id', // Replace with appropriate field in Category model
            as: 'category',
          },
        },
        {
          $group: {
            _id: '$bussCategoriesId', // Group by category ID
            count: { $sum: 1 }, // Calculate the number of businesses per category
            category: { $first: '$category' }, // Get the first category object (if using Category model)
          },
        },
      ]);

      // aggregate functions
      const getBusinessStats = async (filter: any) => await this.ProductModel.aggregate([
        {
          $match: filter,
        },
        {
          $unwind: '$bussCategoriesId', // Unwind bussCategoriesId array
        },
        {
          $lookup: {
            from: 'BussCategory', // Replace with your category collection name
            localField: 'bussCategoriesId',
            foreignField: '_id', // Replace with appropriate field in Category model
            as: 'category',
          },
        },
        {
          $group: {
            _id: '$bussCategoriesId', // Group by category ID
            count: { $sum: 1 }, // Calculate the number of businesses per category
            category: { $first: '$category' }, // Get the first category object (if using Category model)
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id from the result
            categoryId: '$_id', // Rename _id to categoryId
            count: 1,
            category: 1, // Include category details if using Category model
          },
        },
        { $sort: { count: -1 as any } },
      ]);

      // all business statics
      const getAllProductStats = await getBusinessStats(
        { ...findQuery },
      );

      // Count businesses for each category in the given date range
      const filteredProductStats = await getBusinessStats(
        {
          ...findQuery,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      );
      // Count businesses for each category in the previous date range
      const previousDateFilter = {
        $gte: new Date(subDays(startDate.getTime(), daysDifference)), // 30 days before startDate
        $lt: startDate,
      };
      const previousDateProductStats = await getBusinessStats(
        { ...findQuery, createdAt: previousDateFilter },
      );

      // Find the growth or declined rate for each category
      const growthRateStats = getAllProductStats.map(category => {
        const categoryId = category?.categoryId.toString();
        const totalCount = category?.count;
        const currentCount = filteredProductStats.find(c => c.categoryId.toString() === categoryId)?.count || 0;
        const previousCount = previousDateProductStats.find(c => c.categoryId.toString() === categoryId)?.count || 0;
        const deleteCount = deletedProductStats.find(c => c.categoryId.toString() === categoryId)?.count || 0;

        const growthRate = ((currentCount - deleteCount) / (previousCount + currentCount)) * 100;

        return {
          categoryId,
          growthRate,
          currentCount,
          previousCount,
          deleteCount,
          totalCount,

        };
      });
      // Your results
      return {
        deletedProductStats,
        getAllProductStats,
        filteredProductStats,
        previousDateProductStats,
        growthRateStats,
      };
    } catch (error) {
      // Handle errors
      console.error(error);
      throw error;
    }
  }
}
