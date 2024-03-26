import {
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CreateOrderProductCommand } from 'src/modules/order-product/interfaces/create-order-product.interface';
import { OrderProduct } from './schema/order-product.schema';
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
        amount: product.price.sellingPrice,
        quantity: command.quantity,
        businessId: product.businessId,
        userId: command.loggedInUserId ?? null,
        orderId: command.orderId,
        dmoId: product.dmoId,
        authorityId: product.authorityId,
        email: command.email,
        categories: product.categories,
        subCategories: product.subCategories,
        features: product.features,
        createdBy: command.loggedInUserId ?? null,
      });

      const productDetail = await productDetails.save();

      return productDetail;
    } catch (error) {
      exceptionHandling(error);
    }
  }
}
