import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { SortOrder } from 'src/common/enum';
import { paginateData } from 'src/common/pagination';
import { paginationConfig } from 'src/common/pagination.config';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { CreateOrderProductCommand } from 'src/modules/order-product/interfaces/create-order-product.interface';
import { GetAllOrdersDetailsQuery } from 'src/modules/order-product/queries/get-order-details.query';
import { GetOrdersSummaryQuery } from 'src/modules/order-product/queries/get-order-summary.query';
import { OrderProduct } from 'src/modules/order-product/schema/order-product.schema';
import { ProductsService } from 'src/modules/products/products.services';
import { UserType } from 'src/modules/users/users.type';

@Injectable()
export class OrderProductService {
  constructor(
    @InjectModel(OrderProduct.name)
    private OrderProductModel: Model<OrderProduct>,
    private readonly dmoService: DMOService,
    private readonly productsService: ProductsService,
  ) {}

  async create(command: CreateOrderProductCommand): Promise<any> {
    try {
      const product = await this.productsService.findOne(command.productId);

      const productDetails = new this.OrderProductModel({
        productId: command.productId,
        quantity: command.quantity,
        amount: product.price.sellingPrice,
        userId: command.loggedInUserId ?? null,
        orderId: command.orderId,
        createdBy: command.loggedInUserId ?? null,
      });

      const productDetail = await productDetails.save();

      return productDetail;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async findAllForDmo(
    findQuery,
    dmoId: mongoose.Types.ObjectId,
    page: number,
    limit: number,
  ) {
    const pipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'matchedProducts',
        },
      },
      {
        $unwind: '$matchedProducts',
      },
      {
        $match: {
          'matchedProducts.dmoId': dmoId,
        },
      },
      {
        $match: findQuery,
      },
      {
        $project: {
          matchedProducts: 0,
          createdAt: 0,
          updatedAt: 0,
          createdBy: 0,
          updatedBy: 0,
          deletedBy: 0,
          deletedAt: 0,
          __v: 0,
        },
      },
    ];

    const orders = await this.OrderProductModel.aggregate(pipeline);

    const paginatedOrders = paginateData(page, limit, orders);

    return paginatedOrders;
  }

  async getOrderSummary(
    loggedInUser: LoggedInUserInterface,
    query: GetOrdersSummaryQuery,
  ) {
    const validDmoUserType = [
      UserType.DMOADMIN,
      UserType.DMO,
      UserType.SUPERADMIN,
    ];

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'matchedProducts',
        },
      },
      {
        $unwind: '$matchedProducts',
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order_info',
        },
      },
      {
        $unwind: '$order_info',
      },
      {
        $sort: {
          'order_info.createdAt': -1,
        },
      },
    ];

    if (query.status) {
      pipeline.push({
        $match: {
          'order_info.status': query.status,
        },
      });
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

      pipeline.push({
        $match: {
          'order_info.createdAt': {
            $gte: createdStartDate,
            $lt: createdEndDate,
          },
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'businesses',
          localField: 'matchedProducts.businessId',
          foreignField: '_id',
          as: 'business_info',
        },
      },
      {
        $unwind: '$business_info',
      },
    );

    if (loggedInUser.role === UserType.TRAVELLER) {
      pipeline.push({
        $match: {
          'business_info.userId': new mongoose.Types.ObjectId(loggedInUser.id),
        },
      });
    }

    if (validDmoUserType.includes(loggedInUser.role)) {
      let dmoId;

      if (loggedInUser.role === UserType.SUPERADMIN && query.dmoId) {
        dmoId = query.dmoId;
      }

      if ([UserType.DMOADMIN, UserType.DMO].includes(loggedInUser.role)) {
        dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);
      }

      if (dmoId) {
        pipeline.push({
          $match: {
            'business_info.dmoId': new mongoose.Types.ObjectId(dmoId),
          },
        });
      }
    }

    let commonGroupFields: any = {
      _id: '$matchedProducts.businessId',
      businessName: { $first: '$business_info.name' },
      businessEmail: { $first: '$business_info.busiEmail' },
      dmoId: { $first: '$dmo_info._id' },
      dmoName: { $first: '$dmo_info.name' },
      totalNoOfOrders: { $sum: 1 },
      totalAmount: { $sum: '$amount' },
      totalAmountPaidByCreditCard: { $sum: '$order_info.creditCardPayment' },
    };

    if (query.detailedView && query.detailedView.toString() === 'true') {
      commonGroupFields = {
        ...commonGroupFields,
        orders: {
          $push: {
            id: '$order_info._id',
            name: '$order_info.name',
            description: '$order_info.description',
            status: '$order_info.status',
            paymentStatus: '$order_info.paymentStatus',
            email: '$order_info.email',
            countryCode: '$order_info.countryCode',
            phone: '$order_info.phone',
            address: '$order_info.address',
            firstName: '$order_info.firstName',
            lastName: '$order_info.lastName',
            products: {
              $map: {
                input: '$order_info.products',
                as: 'product',
                in: {
                  id: '$$product.id',
                  quantity: '$$product.quantity',
                  // name: '$matchedProducts.name',
                },
              },
            },
          },
        },
      };
    }

    pipeline.push(
      {
        $lookup: {
          from: 'dmos',
          localField: 'business_info.dmoId',
          foreignField: '_id',
          as: 'dmo_info',
        },
      },
      {
        $unwind: '$dmo_info',
      },
      {
        $group: commonGroupFields,
      },
    );

    const orders = await this.OrderProductModel.aggregate(pipeline);

    if (query.page && query.limit) {
      const queryPage = query.page ? Number(query.page) : paginationConfig.page;
      const queryLimit = query.limit
        ? Number(query.limit)
        : paginationConfig.limit;

      const paginatedOrders = paginateData(queryPage, queryLimit, orders);

      return paginatedOrders;
    }

    return orders;
  }

  async findAllOrderDetails(
    loggedInUser: LoggedInUserInterface,
    queries: GetAllOrdersDetailsQuery,
  ) {
    const {
      search, page, limit, status, dmoId, sortBy, sortOrder,
    } = queries;

    const sortOrderValue = sortOrder === SortOrder.ASC ? -1 : 1;
    const sortKey = sortBy || 'createdAt';

    const sort = {
      [`orders.${sortKey}`]: sortOrderValue,
    };

    const pipeline: any[] = [
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $unwind: '$products',
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'orders',
        },
      },
      {
        $unwind: '$orders',
      },
      {
        $sort: sort,
      },
      {
        $lookup: {
          from: 'businesses',
          localField: 'products.businessId',
          foreignField: '_id',
          as: 'business_info',
        },
      },
      {
        $unwind: '$business_info',
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          'products.name': { $regex: search, $options: 'i' },
        },
      });
    }

    if (status) {
      pipeline.push({
        $match: {
          'orders.status': status,
        },
      });
    }

    if (loggedInUser.role === UserType.TRAVELLER) {
      pipeline.push({
        $match: {
          'business_info.userId': new mongoose.Types.ObjectId(loggedInUser.id),
        },
      });
    }

    const validDmoUserType = [
      UserType.DMOADMIN,
      UserType.DMO,
      UserType.SUPERADMIN,
    ];
    if (validDmoUserType.includes(loggedInUser.role)) {
      let dmoID;

      if (loggedInUser.role === UserType.SUPERADMIN && dmoId) {
        dmoID = dmoId;
      }

      if ([UserType.DMOADMIN, UserType.DMO].includes(loggedInUser.role)) {
        dmoID = await this.dmoService.findDMOByUserID(loggedInUser.id);
      }

      if (dmoId) {
        pipeline.push({
          $match: {
            'business_info.dmoId': new mongoose.Types.ObjectId(dmoID),
          },
        });
      }
    }

    pipeline.push({
      $project: {
        business_info: 0,
        updatedAt: 0,
        createdBy: 0,
        updatedBy: 0,
        deletedBy: 0,
        deletedAt: 0,
        __v: 0,
      },
    });

    const orders = await this.OrderProductModel.aggregate(pipeline);

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    const paginatedOrders = paginateData(queryPage, queryLimit, orders);

    return paginatedOrders;
  }
}
