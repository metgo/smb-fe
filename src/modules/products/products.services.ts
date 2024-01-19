/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { sellingPriceForAmountOrPercent } from 'src/common/utils/discount-calculation';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByFieldNames, queryhandler, updateWhere,
} from 'src/core/helper/query-helper';
import { BusinessService } from 'src/modules/business/business.service';
import { Business } from 'src/modules/business/schema/business.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { ProductDto } from 'src/modules/products/dto/product.dto';
import {
  FindProductsQuery, ProductStatus, UpdateCommand, UploadMediaCommand,
} from 'src/modules/products/products.type';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import { WebCreateProduct } from './dto/web-create-product.dto';
import { UserType } from 'src/modules/users/users.type';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    private readonly gcpBucketServices: GcpBucketService,
    private readonly businessService: BusinessService,
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

    const product = await newProduct.save();

    // add products to business
    await this.businessService.addProductToBusiness(businessId, product.id);
    return product;
  }

  async createForWeb(
    loggedInUserId: string,
    businessId: string,
    business: Business,
    body: WebCreateProduct,
    files: Array<Express.Multer.File>,
  ): Promise<Product> {
    let price;
    let quantity;
    if (body?.price?.markedPrice) {
      const sellingPrice = sellingPriceForAmountOrPercent(
        body.price.markedPrice,
        body.price.discountAmount,
        body.price.discountPercent,
      );

      price = {
        ...body.price,
        sellingPrice,
      };
    }

    if (body.quantity) {
      quantity = {
        ...body.quantity,
        remaining: body.quantity?.initial ? body.quantity.initial : 0,
      };
    }

    const images = [];
    await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        // store in gcp
        const imageUrl = await this.gcpBucketServices.upload(file);
        const imageObject = {

          image: imageUrl || null,
          caption: file?.originalname || null,
          alt: file?.originalname || null,

        };
        images.push(imageObject);
      }),
    );
    // const productImageUrl = file ? await this.gcpBucketServices.upload(file) : null;

    // const images = [{
    //   image: productImageUrl,
    //   caption: file?.originalname || null,
    //   alt: file?.originalname || null,
    // }];

    const createdField = {
      ...body,
      price,
      quantity,
      businessId,
      createdBy: loggedInUserId,
      primaryUserId: business?.userId || null,
      dmoId: business.dmoId,
      images,
    };

    const newProduct = new this.ProductModel({
      ...createdField,
    });

    const product = await newProduct.save();

    // add products to business
    await this.businessService.addProductToBusiness(businessId, product.id);
    return product;
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

  async findOneForAdminOrPrimaryUser(productId: string, loggedInUser: any): Promise<Product> {
    const product = await findOneByFieldNames<Product>(
      this.ProductModel,
      { _id: productId },
    );
    const allowedRoles = [UserType.ADMIN, UserType.DMO, UserType.SUPERADMIN];

    if (!product || (
      !allowedRoles.includes(loggedInUser.role)
      && !product.primaryUserId.equals(new mongoose.Types.ObjectId(loggedInUser.id))
      && !product.collaboratorId.includes(new mongoose.Types.ObjectId(loggedInUser.id))
    )
    ) {
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }

    return product;
  }

  async findAll(queries: FindProductsQuery) : Promise<Product[]> {
    const {
      search, page, limit, ...query
    } = queries.query;

    let findQuery: any = query;
    const select = `${disSelect}`;
    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    if (!('status' in query) && !queries.myProduct && !queries.collaboratedProducts && !queries.isAdmin) {
      findQuery = { ...query, status: ProductStatus.ACTIVE };
    }

    if (search) {
      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      };
    }

    if (queries.myProduct) {
      findQuery = { ...findQuery, primaryUserId: queries.loggedInUser };
    }

    if (queries.collaboratedProducts) {
      findQuery = { ...findQuery, collaboratorId: queries.loggedInUser };
    }

    const products = await queryhandler<Product>(
      this.ProductModel,
      findQuery,
      select,
      queryPage,
      queryLimit,
    );
    return products;
  }

  async findManyById(ids: string[]): Promise<Product[]> {
    const findQuery = { _id: { $in: ids } };
    let select: {};
    let page: number;
    let limit: number;

    const products = await queryhandler<Product>(
      this.ProductModel,
      findQuery,
      select,
      page,
      limit,
    );
    return products;
  }

  async update(command: UpdateCommand): Promise<Product> {
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

    const updatedField = {
      ...command.body,
      updatedBy: command.loggedInUserId,
      updatedAt: new Date(),
      price,
      quantity,
    };

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

  async uploadMedia(command: UploadMediaCommand) {
    const updatedField = {
      updatedBy: command.loggedInUserId,
      updatedAt: new Date(),
    };

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
      {
        $push: { images: { $each: command.body } },
        $set: updatedField,
      },
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

  async updateProductByFields(productId: string, updatedFields: any): Promise<Product> {
    const productInfo = await this.findOne(productId);
    const updatedField = {
      ...updatedFields,
      quantity: {
        initial: productInfo.quantity.initial,
        sold: (!productInfo.quantity.sold ? 0 : productInfo.quantity.sold) + updatedFields.sold,
        remaining: productInfo.quantity.remaining - updatedFields.sold,
      },
    };

    const updatedProduct = await updateWhere<Product>(
      this.ProductModel,
      {
        _id: productId,
      },
      { ...updatedField },
    );

    return updatedProduct;
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
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }

    return updateProduct;
  }
}
