/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { sellingPriceForAmountOrPercent } from 'src/common/utils/discount-calculation';
import {
  findOneByFieldNames, queryhandler, updateWhere,
} from 'src/core/helper/query-helper';
import { Business } from 'src/modules/business/schema/business.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { ProductDto } from 'src/modules/products/dto/product.dto';
import { FindProducts, ProductStatus, updateCommand } from 'src/modules/products/products.type';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
  ) {}

  async create(
    userId: string,
    businessId: string,
    business: Business,
    body: ProductDto,
  ): Promise<Product> {
    const sellingPrice = sellingPriceForAmountOrPercent(
      body.price.markedPrice,
      body.price.discountAmount,
      body.price.discountPercent,
    );

    const price = {
      ...body.price,
      sellingPrice,
    };

    const quantity = {
      ...body.quantity,
      remaining: body.quantity.initial,
    };

    const createdField = {
      ...body,
      price,
      quantity,
      businessId,
      createdBy: userId,
      primaryUserId: business.userId,
      dmoId: business.dmoId,
    };

    const newProduct = new this.ProductModel({
      ...createdField,
    });

    return await newProduct.save();
  }

  async findOne(productId: string): Promise<Product> {
    const product = await findOneByFieldNames<Product>(
      this.ProductModel,
      { _id: productId, status: ProductStatus.ACTIVE },
    );

    if (!product) {
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }

    return product;
  }

  async findAll(queries: FindProducts) : Promise<Product[]> {
    const {
      query, myProduct, collaboratedProducts, loggedInUser,
    } = queries;

    let findQuery: any = query;
    let select: {};
    const page: number = query?.page || paginationConfig.page;
    const limit: number = query?.limit || paginationConfig.limit;

    findQuery = { ...query, status: ProductStatus.ACTIVE };

    if (myProduct) {
      findQuery = { ...query, primaryUserId: loggedInUser };
    }

    if (collaboratedProducts) {
      findQuery = { ...query, collaboratorId: loggedInUser };
    }

    const products = await queryhandler<Product>(
      this.ProductModel,
      findQuery,
      select,
      page,
      limit,
    );
    return products;
  }

  async update(command: updateCommand): Promise<Product> {
    let updatedField = {
      ...command.body,
      updatedBy: command.loggedInUserId,
      updatedAt: new Date(),
    };

    if (command.body instanceof ProductDto) {
      const sellingPrice = sellingPriceForAmountOrPercent(
        command.body.price.markedPrice,
        command.body.price.discountAmount,
        command.body.price.discountPercent,
      );

      const price = {
        ...command.body.price,
        sellingPrice,
      };

      // might need to update in later
      const quantity = {
        ...command.body.quantity,
        remaining: command.body.quantity.initial,
      };

      updatedField = { ...updatedField, price, quantity };
    }

    if (!(command.body instanceof ProductDto)) {
      updatedField = {
        ...updatedField,
        images: command.body,
      };
    }

    const updatedProduct = await updateWhere<Product>(
      this.ProductModel,
      {
        _id: command.productId,
        businessId: command.businessId,
        $or: [
          { primaryUserId: command.loggedInUserId },
          { collaboratorId: command.loggedInUserId },
        ],
      },
      { ...updatedField },
    );

    if (!updatedProduct) {
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }
    return updatedProduct;
  }

  async softDelete(businessId: string, productId: string, loggedInUser: string): Promise<Product> {
    const deletedProduct = await updateWhere<Product>(
      this.ProductModel,
      {
        _id: productId,
        businessId,
        $or: [
          { primaryUserId: loggedInUser },
          { collaboratorId: loggedInUser },
        ],
      },
      { deletedAt: new Date(), deletedBy: loggedInUser, isDeleted: true },
    );

    if (!deletedProduct) {
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }

    return deletedProduct;
  }

  async deleteImage(loggedInUserId: string, id: string, imageUrl: any): Promise<Product> {
    const existingProduct = await this.ProductModel.findById(id);

    const images = existingProduct.images.filter(image => image.image !== imageUrl);

    const updateProduct = await this.ProductModel.findOneAndUpdate(
      { _id: id },
      { images, updatedAt: new Date(), updatedBy: loggedInUserId },
      { new: true },
    );
    if (!updateProduct) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }

    return updateProduct;
  }
}
