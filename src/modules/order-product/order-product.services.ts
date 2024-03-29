import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { paginateData } from 'src/common/pagination';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CreateOrderProductCommand } from 'src/modules/order-product/interfaces/create-order-product.interface';
import { OrderProduct } from 'src/modules/order-product/schema/order-product.schema';
import { ProductsService } from 'src/modules/products/products.services';

@Injectable()
export class OrderProductService {
  constructor(
    @InjectModel(OrderProduct.name)
    private OrderProductModel: Model<OrderProduct>,
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
}
