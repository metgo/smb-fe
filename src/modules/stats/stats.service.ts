/* eslint-disable max-len */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { subDays, differenceInDays } from 'date-fns';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { PaymentStatus, VoucherPaymentStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { LoggedInUserInterface } from '../auth/interface/login.interface';
import { Business } from '../business/schema/business.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { Product } from '../products/schema/products.schema';
import { UserType } from '../users/users.type';
import { GetALLBusinessProductStatsquery } from './query/query.dto';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { GetByDateRangeQuery } from 'src/modules/stats/query/get-date-range.query';
import { Voucher } from 'src/modules/vouchers/schema/voucher.schema';
import { calculateTotalAmount } from 'src/common/calculate-amounts';
import { calculateAverage } from 'src/common/calculate-average';
import { OrderProduct } from '../order-product/schema/order-product.schema';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Campaign.name)
    private CampaignModel: Model<Campaign>,
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    @InjectModel(Order.name)
    private OrderModel: Model<Order>,
    @InjectModel(OrderProduct.name)
    private OrderProductModel: Model<OrderProduct>,
    @InjectModel('Product')
    private ProductModel: Model<Product>,
    @InjectModel(Voucher.name)
    private VoucherModel: Model<Voucher>,
  ) {}

  async getBusinessStats(
    loginUser: LoggedInUserInterface,
    query: GetALLBusinessProductStatsquery,
  ) {
    const {
      startDate, endDate, categoriesId, dmoId, authorityId, ...queries
    }
      = query;

    const newStartDate = new Date(query.startDate);
    const newEndDate = new Date(query.endDate);
    newEndDate.setDate(newEndDate.getDate() + 1);

    if (newStartDate >= newEndDate) {
      throw new BadRequestException(`Created ${ServerErrors.DATE_IS_NOT_LESS}`);
    }

    const daysDifference = differenceInDays(newEndDate, newStartDate);

    let findQuery: any = {
      ...queries,
    };

    if (dmoId) {
      findQuery = {
        ...findQuery,
        dmoId: new mongoose.Types.ObjectId(dmoId),
      };
    }

    if (authorityId) {
      findQuery = {
        ...findQuery,
        authorityId: new mongoose.Types.ObjectId(authorityId),
      };
    }
    if (loginUser?.role === UserType.TRAVELLER) {
      findQuery = {
        ...findQuery,
        userId: loginUser.id,
      };
    }
    if (
      loginUser?.role === UserType.DMO
      || loginUser?.role === UserType.DMOADMIN
    ) {
      findQuery = {
        ...findQuery,
        dmoId: loginUser.dmo.id,
      };
    }

    if (loginUser?.role === UserType.AUTHORITY) {
      findQuery = {
        ...findQuery,
        authorityId: loginUser.authority.id,
      };
    }
    try {
      const dateFilter = {
        $gte: newStartDate,
        $lt: newEndDate,
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
      const getAllBusinessStats = await getBusinessStats({ ...findQuery });

      // Count businesses for each category in the given date range
      const filteredBusinessStats = await getBusinessStats({
        ...findQuery,
        createdAt: {
          $gte: newStartDate,
          $lt: newEndDate,
        },
      });
      // Count businesses for each category in the previous date range
      const previousDateFilter = {
        $gte: new Date(subDays(newStartDate.getTime(), daysDifference)), // 30 days before newStartDate
        $lt: newStartDate,
      };
      const previousDateBusinessStats = await getBusinessStats({
        ...findQuery,
        createdAt: previousDateFilter,
      });

      // Find the growth or declined rate for each category
      const growthRateStats = getAllBusinessStats.map(category => {
        const categoryId = category?.categoryId.toString();
        const totalCount = category?.count;
        const currentCount
          = filteredBusinessStats.find(
            c => c.categoryId.toString() === categoryId,
          )?.count || 0;
        const previousCount
          = previousDateBusinessStats.find(
            c => c.categoryId.toString() === categoryId,
          )?.count || 0;
        const deleteCount
          = deletedBusinessStats.find(
            c => c.categoryId.toString() === categoryId,
          )?.count || 0;

        const growthRate
          = ((currentCount - deleteCount) / (previousCount + currentCount)) * 100;

        return {
          categoryId,
          growthRate,
          currentCount,
          previousCount,
          deleteCount,
          totalCount,
        };
      });

      const totalNumberOfBusinesses = await this.BusinessModel.count({
        ...findQuery,
      });
      // Your results
      return {
        deletedBusinessStats,
        getAllBusinessStats,
        filteredBusinessStats,
        previousDateBusinessStats,
        growthRateStats,
        totalNumberOfBusinesses,
      };
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async getProductStats(
    loginUser: LoggedInUserInterface,
    query: GetALLBusinessProductStatsquery,
  ) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    endDate.setDate(endDate.getDate() + 1);

    const daysDifference = differenceInDays(endDate, startDate);
    let findQuery: any = {};
    if (startDate >= endDate) {
      throw new BadRequestException(`Created ${ServerErrors.DATE_IS_NOT_LESS}`);
    }

    if (query.dmoId) {
      findQuery = {
        ...findQuery,
        dmoId: new mongoose.Types.ObjectId(query.dmoId),
      };
    }

    if (query.authorityId) {
      findQuery = {
        ...findQuery,
        authorityId: new mongoose.Types.ObjectId(query.authorityId),
      };
    }

    if (loginUser.role === UserType.TRAVELLER) {
      findQuery = {
        ...findQuery,
        userId: loginUser.id,
      };
    }
    if (
      loginUser.role === UserType.DMO
      || loginUser.role === UserType.DMOADMIN
    ) {
      findQuery = {
        ...findQuery,
        dmoId: loginUser.dmo.id,
      };
    }

    if (loginUser?.role === UserType.AUTHORITY) {
      findQuery = {
        ...findQuery,
        authorityId: loginUser.authority.id,
      };
    }
    try {
      const dateFilter = {
        $gte: startDate,
        $lt: endDate,
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
            localField: 'categories',
            foreignField: '_id', // Replace with appropriate field in Category model
            as: 'category',
          },
        },
        {
          $group: {
            _id: '$categories', // Group by category ID
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
          $unwind: '$categories', // Unwind bussCategoriesId array
        },
        {
          $lookup: {
            from: 'BussCategory', // Replace with your category collection name
            localField: 'categories',
            foreignField: '_id', // Replace with appropriate field in Category model
            as: 'category',
          },
        },
        {
          $group: {
            _id: '$categories', // Group by category ID
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
      const getAllProductStats = await getBusinessStats({ ...findQuery });

      // Count businesses for each category in the given date range
      const filteredProductStats = await getBusinessStats({
        ...findQuery,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      });
      // Count businesses for each category in the previous date range
      const previousDateFilter = {
        $gte: new Date(subDays(startDate.getTime(), daysDifference)), // 30 days before startDate
        $lt: startDate,
      };
      const previousDateProductStats = await getBusinessStats({
        ...findQuery,
        createdAt: previousDateFilter,
      });

      // Find the growth or declined rate for each category
      const growthRateStats = getAllProductStats.map(category => {
        const categoryId = category?.categoryId.toString();
        const totalCount = category?.count;
        const currentCount
          = filteredProductStats.find(
            c => c.categoryId.toString() === categoryId,
          )?.count || 0;
        const previousCount
          = previousDateProductStats.find(
            c => c.categoryId.toString() === categoryId,
          )?.count || 0;
        const deleteCount
          = deletedProductStats.find(
            c => c.categoryId.toString() === categoryId,
          )?.count || 0;

        const growthRate
          = ((currentCount - deleteCount) / (previousCount + currentCount)) * 100;

        return {
          categoryId,
          growthRate,
          currentCount,
          previousCount,
          deleteCount,
          totalCount,
        };
      });

      const totalNumberOfProducts = await this.ProductModel.count({
        ...findQuery,
      });

      // Your results
      return {
        deletedProductStats,
        getAllProductStats,
        filteredProductStats,
        previousDateProductStats,
        growthRateStats,
        totalNumberOfProducts,
      };
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async getCampaignStats(
    loggedInUser: LoggedInUserInterface,
    query: GetByDateRangeQuery,
  ) {
    let findQuery;
    let orderFindQuery: any = { paymentStatus: PaymentStatus.SUCCESS };
    if (
      loggedInUser.role === UserType.DMOADMIN
      || loggedInUser.role === UserType.DMO
    ) {
      const dmoId = loggedInUser.dmo.id;

      findQuery = {
        dmoIds: { $in: dmoId },
      };
    }

    if (query.startDate && query.endDate) {
      const createdStartDate = new Date(query.startDate);
      const createdEndDate = new Date(query.endDate);
      createdEndDate.setDate(createdEndDate.getDate() + 1);

      if (createdStartDate >= createdEndDate) {
        throw new BadRequestException(
          `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
        );
      }
      orderFindQuery = {
        ...orderFindQuery,
        createdAt: {
          $gte: createdStartDate,
          $lt: createdEndDate,
        },
      };
    }

    const [campaigns, vouchers, products, orders] = await Promise.all([
      this.CampaignModel.find({ ...findQuery }),
      this.VoucherModel.find(),
      this.ProductModel.find(),
      this.OrderModel.find({ ...orderFindQuery }),
    ]);

    const data: any = [];

    await Promise.all(
      campaigns.map(async campaign => {
        const relatedVouchers = vouchers.filter(
          voucher => voucher.campId.toString() === campaign._id.toString(),
        );

        const { vouchersRemainingAmount, vouchersActualAmount }
          = relatedVouchers.reduce(
            (acc, voucher) => {
              acc.vouchersRemainingAmount += voucher.remainingAmount;
              acc.vouchersActualAmount += voucher.amount;
              return acc;
            },
            { vouchersRemainingAmount: 0, vouchersActualAmount: 0 },
          );

        let totalPurchasedAmount = 0;
        let totalPurchaseMadeByCreditCard = 0;
        let totalProductsPurchased = 0;

        const relatedProducts = products.filter(product => campaign.dmoIds.includes(product.dmoId));

        if (relatedProducts?.length) {
          const productsId = relatedProducts.map(obj => obj.id);

          const relatedOrders = orders.filter(order => order.products.some(product => productsId.includes(product.id.toString())));

          if (relatedOrders?.length) {
            await Promise.all(
              relatedOrders.map(async order => {
                totalPurchasedAmount += order.totalAmount;
                totalPurchaseMadeByCreditCard += order.creditCardPayment;
                totalProductsPurchased += 1;
              }),
            );
          }
        }

        data.push({
          campaign: campaign._id,
          products: relatedProducts?.length || 0,
          vouchers: relatedVouchers.length,
          noOfProductsPurchased: totalProductsPurchased,
          totalAmountOfProductsPurchased: totalPurchasedAmount,
          productsPurchasedViaCreditCard: totalPurchaseMadeByCreditCard,
          productsPurchasedViaVouchers:
            totalPurchasedAmount - totalPurchaseMadeByCreditCard,
          vouchersRemainingAmount,
          vouchersActualAmount,
        });
      }),
    );

    return data;
  }

  async getPurchaseReports(query: GetByDateRangeQuery) {
    let findQuery;
    let totalOrderAmount = 0;
    let averageOrderAmount = 0;
    let totalVoucherAmount = 0;
    let averageVoucherAmountSold = 0;
    let averageVoucherAmountRedeemed = 0;

    if (query.startDate && query.endDate) {
      const createdStartDate = new Date(query.startDate);
      const createdEndDate = new Date(query.endDate);
      createdEndDate.setDate(createdEndDate.getDate() + 1);

      if (createdStartDate >= createdEndDate) {
        throw new BadRequestException(
          `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
        );
      }

      findQuery = {
        createdAt: {
          $gte: createdStartDate,
          $lt: createdEndDate,
        },
      };
    }
    const orders = await this.OrderModel.find({
      ...findQuery,
      paymentStatus: PaymentStatus.SUCCESS,
    });

    if (orders?.length) {
      // value of total product purchase
      totalOrderAmount = await calculateTotalAmount('totalAmount', orders);

      // view of average order transaction
      averageOrderAmount = await calculateAverage(
        totalOrderAmount,
        orders.length,
      );

      // average voucher redeemed
      let totalVoucherAmountRedeemed: number = 0;
      let totalVoucherLength: number = 0;

      await Promise.all(
        orders.map(async order => {
          if (order.voucher && order?.voucher?.length) {
            await Promise.all(
              order.voucher.map(async voucher => {
                if (voucher?.redeemedAmount && voucher?.redeemedAmount > 0) {
                  totalVoucherAmountRedeemed += voucher.redeemedAmount;
                  totalVoucherLength += 1;
                }
              }),
            );
          }
        }),
      );

      averageVoucherAmountRedeemed = await calculateAverage(
        totalVoucherAmountRedeemed,
        totalVoucherLength,
      );
    }

    const vouchers = await this.VoucherModel.find({
      ...findQuery,
      paymentStatus: VoucherPaymentStatus.PAID,
    });

    if (vouchers?.length) {
      // value of total voucher amount purchase
      totalVoucherAmount = await calculateTotalAmount('amount', vouchers);

      // view of average vouchers sold
      averageVoucherAmountSold = await calculateAverage(
        totalVoucherAmount,
        vouchers.length,
      );
    }

    return {
      totalOrderAmount,
      averageOrderAmount,
      totalVoucherAmount,
      averageVoucherAmountSold,
      averageVoucherAmountRedeemed,
    };
  }

  async getAllPopulars() {
    // Display of the most viewed products - dummy - list (5)
    const products = [
      new mongoose.Types.ObjectId('660913f4abea32abc6feb437'),
      new mongoose.Types.ObjectId('66091727abea32abc6feb548'),
      new mongoose.Types.ObjectId('65e84a361a61a535e7f55bfd'),
      new mongoose.Types.ObjectId('660bbe9cabea32abc6ff0e6d'),
      new mongoose.Types.ObjectId('661e2ff5afadbe78d022891a'),
    ];

    const popularProducts = await this.ProductModel.aggregate([
      {
        $match: {
          _id: { $in: products },
        },
      },
      {
        $addFields: {
          __order: {
            $indexOfArray: [products, '$_id'],
          },
        },
      },
      {
        $sort: {
          __order: 1,
        },
      },
    ]);

    // Display of the most purchased products
    const productIdCounts = await this.OrderProductModel.aggregate([
      { $group: { _id: '$productId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const productIds = productIdCounts.map(
      item => new mongoose.Types.ObjectId(item._id),
    );

    const mostPurchasedProducts = await this.ProductModel.find({
      _id: { $in: productIds },
    });

    const top5MostPurchasedProducts = mostPurchasedProducts.map(product => {
      const countObject = productIdCounts.find(
        item => item._id.toString() === product._id.toString(),
      );
      return { product, noOfOrderPlaced: countObject ? countObject.count : 0 };
    });

    top5MostPurchasedProducts.sort(
      (a, b) => b.noOfOrderPlaced - a.noOfOrderPlaced,
    );

    // Display of the most viewed business pages/engagement - dummy - list (5)
    const businesses = [
      new mongoose.Types.ObjectId('65cef0e2d494635a28e5d51d'),
      new mongoose.Types.ObjectId('65cef0e2d494635a28e5d39b'),
      new mongoose.Types.ObjectId('65b11209272d5d15b3958012'),
      new mongoose.Types.ObjectId('65cef0e2d494635a28e5d4e5'),
      new mongoose.Types.ObjectId('65cef0e2d494635a28e5d42c'),
    ];

    const popularBusinesses = await this.BusinessModel.aggregate([
      {
        $match: {
          _id: { $in: businesses },
        },
      },
      {
        $addFields: {
          __order: {
            $indexOfArray: [businesses, '$_id'],
          },
        },
      },
      {
        $sort: {
          __order: 1,
        },
      },
    ]);

    return {
      popularProducts,
      top5MostPurchasedProducts,
      popularBusinesses,
    };
  }
}
