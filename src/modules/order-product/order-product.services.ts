import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { SortOrder } from 'src/common/enum';
import { paginateData } from 'src/common/pagination';
import { paginationConfig } from 'src/common/pagination.config';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { unproject } from 'src/common/utils/select.handling';
import { findOneById } from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { BusinessService } from 'src/modules/business/services/business.service';
import { OrderStatus } from 'src/modules/orders/orders.type';
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
    private readonly productsService: ProductsService,
    private readonly businessService: BusinessService,
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

      pipeline.push(
        {
          $lookup: {
            from: 'payments',
            localField: 'order_info._id',
            foreignField: 'orderId',
            as: 'payments',
          },
        },
        {
          $unwind: {
            path: '$payments',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            $or: [
              {
                'payments.paymentDate': {
                  $gte: createdStartDate,
                  $lt: createdEndDate,
                },
              },
              {
                'order_info.updatedAt': null,
                'order_info.creditCardPayment': 0,
                createdAt: {
                  $gte: createdStartDate,
                  $lt: createdEndDate,
                },
              },
            ],
          },
        },
      );
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

    if (query.search) {
      pipeline.push({
        $match: {
          $or: [
            { 'business_info.name': { $regex: query.search, $options: 'i' } },
            { 'order_info.firstName': { $regex: query.search, $options: 'i' } },
            { 'order_info.lastName': { $regex: query.search, $options: 'i' } },
            { 'order_info.email': { $regex: query.search, $options: 'i' } },
            { 'matchedProducts.name': { $regex: query.search, $options: 'i' } },
          ],
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

    if (validDmoUserType.includes(loggedInUser.role)) {
      let dmoId;

      if (loggedInUser.role === UserType.SUPERADMIN && query.dmoId) {
        dmoId = query.dmoId;
      }

      if ([UserType.DMOADMIN, UserType.DMO].includes(loggedInUser.role)) {
        dmoId = loggedInUser.dmo.id;
      }

      if (dmoId) {
        pipeline.push({
          $match: {
            'business_info.dmoId': new mongoose.Types.ObjectId(dmoId),
          },
        });
      }
    }

    if (validDmoUserType.includes(loggedInUser.role)) {
      let { authorityId } = query;

      if (
        [UserType.AUTHORITY, UserType.AUTHORITY_ADMIN].includes(
          loggedInUser.role,
        )
      ) {
        authorityId = loggedInUser.authority.id;
      }

      if (authorityId) {
        pipeline.push({
          $match: {
            'business_info.authorityId': new mongoose.Types.ObjectId(
              authorityId,
            ),
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
      authorityId: { $first: '$authority_info._id' },
      authorityName: { $first: '$authority_info.name' },
      totalNoOfOrders: { $sum: 1 },
      totalAmount: { $sum: '$amount' },
      totalAmountPaidByCreditCard: { $sum: '$order_info.creditCardPayment' },
    };

    if (query.detailedView && /true/.test(query.detailedView)) {
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
            orderInitiatedDate: '$order_info.createdAt',
            orderSuccessDate: '$createdAt',
            paymentSuccessDate: '$payments.paymentDate',
            totalAmount: '$order_info.totalAmount',
            amountPaidByCreditCard: '$order_info.creditCardPayment',
            products: {
              $map: {
                input: '$order_info.products',
                as: 'product',
                in: {
                  id: '$$product.id',
                  quantity: '$$product.quantity',
                  name: '$matchedProducts.name',
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
          from: 'authorities',
          localField: 'business_info.authorityId',
          foreignField: '_id',
          as: 'authority_info',
        },
      },
      {
        $unwind: {
          path: '$authority_info',
          preserveNullAndEmptyArrays: true,
        },
      },
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
      { $sort: { totalNoOfOrders: -1 } },
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
      search,
      page,
      limit,
      status,
      dmoId,
      productId,
      authorityId,
      voucherId,
      sortBy,
      sortOrder,
    } = queries;

    const sortOrderValue = sortOrder === SortOrder.ASC ? 1 : -1;
    const sortKey = sortBy || 'createdAt';

    const sort = {
      [sortKey]: sortOrderValue,
      'payments.paymentDate': sortOrderValue,
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
        $match: {
          'orders.status': status || OrderStatus.PROCESSING,
        },
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

    if (loggedInUser.role === UserType.TRAVELLER && loggedInUser.hasBusiness) {
      const businesses = await this.businessService.getMyBusiness(
        loggedInUser.id,
      );

      const businessIds = businesses.map(buss => buss._id);

      pipeline.push({
        $match: {
          'business_info._id': { $in: businessIds },
        },
      });
    }

    if (search) {
      pipeline.push({
        $match: {
          'products.name': { $regex: search, $options: 'i' },
        },
      });
    }

    if (productId) {
      pipeline.push({
        $match: {
          'products._id': new mongoose.Types.ObjectId(productId),
        },
      });
    }

    if (voucherId) {
      pipeline.push({
        $match: {
          'orders.voucher.id': voucherId,
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
        dmoID = loggedInUser.dmo.id;
      }

      if (dmoID) {
        pipeline.push({
          $match: {
            'business_info.dmoId': new mongoose.Types.ObjectId(dmoID),
          },
        });
      }
    }

    if (authorityId || loggedInUser.role === UserType.AUTHORITY) {
      const authorityID
        = loggedInUser.role === UserType.AUTHORITY
          ? new mongoose.Types.ObjectId(loggedInUser.authority.id)
          : new mongoose.Types.ObjectId(authorityId);
      pipeline.push({
        $match: {
          'business_info.authorityId': authorityID,
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'payments',
          localField: 'orders._id',
          foreignField: 'orderId',
          as: 'payments',
        },
      },
      {
        $unwind: {
          path: '$payments',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: sort,
      },
      {
        $project: {
          business_info: 0,
          ...unproject,
          orders: {
            products: 0,
            ...unproject,
          },
          payments: {
            ...unproject,
            products: 0,
            voucherId: 0,
            orderId: 0,
            status: 0,
            currency: 0,
            method: 0,
            methods: 0,
            customerName: 0,
            identificationNumber: 0,
            customerEmail: 0,
            purpose: 0,
            payment: 0,
          },
          products: {
            images: 0,
            ...unproject,
          },
        },
      },
    );

    const orders = await this.OrderProductModel.aggregate(pipeline);

    let orderTotalAmount = 0;
    await Promise.all(
      orders.map(async order => {
        orderTotalAmount += order.amount;
        return orderTotalAmount;
      }),
    );
    const paginatedOrders = paginateData(Number(page), Number(limit), orders);

    return { ...paginatedOrders, orderTotalAmount };
  }

  async findById(id: string) {
    const orderProduct = await findOneById<OrderProduct>(
      this.OrderProductModel,
      id,
    );

    return orderProduct;
  }
}
