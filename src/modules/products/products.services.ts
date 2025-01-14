/* eslint-disable no-undef */
/* eslint-disable no-nested-ternary */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { calculateGrowthPercentage } from 'src/common/utils/calculate-growth-percentage';
import { getRandomNumberBetween } from 'src/common/utils/random-number-range';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  findOneByIDPopulate,
  queryhandler,
  updateManyByIds,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { Product } from 'src/modules/products/schema/products.schema';
import {
  GetProductsQuery,
  UploadMediaCommand,
} from 'src/modules/products/interface';
import { GetProductsStatsQuery } from 'src/modules/products/queries';
import { ProductStatus } from 'src/modules/products/products.type';
import { UserType } from 'src/modules/users/users.type';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
  ) {}

  async seed() {
    const products = await this.ProductModel.find();

    await Promise.all(
      products.map(async b => {
        const impact = getRandomNumberBetween(9, 73);
        await this.ProductModel.updateOne(
          { _id: b.id },
          {
            $set: { impact },
          },
        );
      }),
    );
  }

  async findOne(productId: string | mongoose.Types.ObjectId): Promise<Product> {
    const populate = {
      path: 'categories subCategories',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };
    const populate1 = {
      path: 'dmoId authorityId',
      select: `${disSelect}`,
    };
    const select = `${disSelect}`;
    try {
      const product = await this.ProductModel.findById(productId)
        .select(select)
        .populate(populate)
        .populate(populate1);

      if (!product || product.status !== ProductStatus.ACTIVE) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }
      return product;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findOneForLoggedInUser(
    productId: string,
    loggedInUser: LoggedInUserInterface,
  ): Promise<Product> {
    const populate = {
      path: 'categories subCategories businessId dmoId',
      select: `${disSelect}`,
    };
    try {
      let findQuery: any = {
        _id: productId,
      };

      if (
        loggedInUser.role === UserType.DMOADMIN
        || loggedInUser.role === UserType.DMO
      ) {
        const dmoId = loggedInUser.dmo.id;

        findQuery = {
          ...findQuery,
          dmoId,
        };
      }

      if (loggedInUser.role === UserType.AUTHORITY) {
        const authorityId = loggedInUser.authority.id;

        findQuery = {
          ...findQuery,
          authorityId,
        };
      }

      const product = await findOneByIDPopulate<Product>(
        this.ProductModel,
        findQuery,
        populate,
      );
      const allowedRoles = [
        UserType.AUTHORITY,
        UserType.ADMIN,
        UserType.DMO,
        UserType.DMOADMIN,
        UserType.SUPERADMIN,
      ];
      if (
        !product
        || (!allowedRoles.includes(loggedInUser.role)
          && !product.primaryUserId.equals(
            new mongoose.Types.ObjectId(loggedInUser.id),
          )
          && !product.collaboratorId.includes(
            new mongoose.Types.ObjectId(loggedInUser.id),
          ))
      ) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return product;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findAll(queries: GetProductsQuery): Promise<Product[]> {
    const {
      search, page, limit, ...query
    } = queries.query;

    let findQuery: any = query;
    const select = `${disSelect}`;

    if (
      !('status' in query)
      && !queries.myProduct
      && !queries.collaboratedProducts
      && !queries.isAdmin
    ) {
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
      findQuery = { ...findQuery, primaryUserId: queries.loggedInUser.id };
    }

    if (queries.collaboratedProducts) {
      findQuery = { ...findQuery, collaboratorId: queries.loggedInUser.id };
    }

    let populate = {
      path: 'businessId',
      select: `${disSelect}`,
    };

    if (
      queries.isAdmin
      && (queries.loggedInUser.role === UserType.DMOADMIN
        || queries.loggedInUser.role === UserType.DMO)
    ) {
      const dmoId = queries.loggedInUser.dmo.id;

      findQuery = {
        ...findQuery,
        dmoId,
      };
    }

    if (queries.isAdmin && queries.loggedInUser.role === UserType.AUTHORITY) {
      const authorityId = queries.loggedInUser.authority.id;

      findQuery = {
        ...findQuery,
        authorityId,
      };
    }

    if (queries.isAdmin) {
      populate = {
        path: 'categories subCategories businessId',
        select: `${disSelect}`,
      };
    }

    const products = await queryhandler<Product>(this.ProductModel, {
      findQuery,
      select,
      page: Number(page),
      limit: Number(limit),
      populate,
    });

    return products;
  }

  async findManyById(ids: string[]): Promise<Product[]> {
    try {
      const findQuery = { _id: { $in: ids } };
      let select: {};
      let page: number;
      let limit: number;

      const products = await queryhandler<Product>(this.ProductModel, {
        findQuery,
        select,
        page,
        limit,
      });

      if (!products?.data?.length) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return products;
    } catch (error) {
      this.logger.error('[PRODUCT]: FAILED TO LIST PRODUCTS', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  async uploadMedia(command: UploadMediaCommand) {
    try {
      const updatedField = {
        updatedBy: command.loggedInUserId,
        updatedAt: new Date(),
      };

      let updatedProduct: mongoose.Document<unknown, {}, Product> &
        Product & {
          _id: mongoose.Types.ObjectId;
        };
      if (command.role === UserType.SUPERADMIN) {
        updatedProduct = await updateOneByManyFields<Product>(
          this.ProductModel,
          {
            _id: command.productId,
            businessId: command.businessId,
          },
          {
            $push: { images: { $each: command.body } },
            $set: updatedField,
          },
        );
      } else {
        updatedProduct = await updateOneByManyFields<Product>(
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
      }

      if (!updatedProduct) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      this.logger.info(`[PRODUCT]: UPLOADED IMAGES for ${command.productId}`);

      return updatedProduct;
    } catch (err) {
      this.logger.error(
        `[PRODUCT]: FAILED TO UPLOAD IMAGE productId:${command.productId}`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async deleteImage(
    loggedInUserId: string,
    id: string,
    imageUrl: any,
  ): Promise<Product> {
    const existingProduct = await this.ProductModel.findById(id);

    if (!existingProduct) {
      throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
    }

    const images = existingProduct.images.filter(
      image => image.image !== imageUrl,
    );

    if (!images?.length) {
      throw new BadRequestException(ServerErrors.PRODUCT.IMAGE_EMPTY);
    }

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

  async assignUserToProducts(
    businessIds: string[],
    assignUserId: string,
    loggedInUserId: string,
  ) {
    try {
      const productIds = await this.ProductModel.distinct('_id', {
        businessId: { $in: businessIds },
      });

      const updatedField = {
        primaryUserId: assignUserId,
        updatedBy: loggedInUserId,
      };
      const updateProducts = await updateManyByIds<Product>(
        this.ProductModel,
        '_id',
        productIds,
        updatedField,
      );

      if (!updateProducts) {
        throw new BadRequestException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      return updateProducts;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async getProductInformationForOrders(productInfo) {
    try {
      const ids = productInfo.map(item => item.id?.toString());
      const products = await this.ProductModel.find({ _id: { $in: ids } });

      if (!products?.length) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return products;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        throw new BadRequestException(
          `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      exceptionHandling(error);
    }
  }

  async getStats(
    loggedInUser: LoggedInUserInterface,
    query: GetProductsStatsQuery,
  ) {
    try {
      const {
        startDate, endDate, categoriesId, dmoId,
      } = query;

      const select = disSelect;

      let findQuery: any = {};

      if (categoriesId) {
        const categoryIds = Array.isArray(categoriesId)
          ? categoriesId
          : [categoriesId];

        findQuery = {
          ...findQuery,
          categoriesId: { $in: categoryIds },
        };
      }

      if (dmoId) {
        findQuery = {
          ...findQuery,
          dmoId,
        };
      }

      if (loggedInUser.role === UserType.DMOADMIN) {
        const dmoID = loggedInUser.dmo.id;
        findQuery = {
          ...findQuery,
          dmoId: dmoID,
        };
      }

      if (loggedInUser.role === UserType.TRAVELLER) {
        findQuery = {
          ...findQuery,
          userId: loggedInUser.id,
        };
      }

      let createdFindQuery: any = {
        ...findQuery,
        isDeleted: false,
      };
      let deletedFindQuery: any = {
        ...findQuery,
        isDeleted: true,
      };

      if (startDate && endDate) {
        const createdStartDate = new Date(startDate);
        const createdEndDate = new Date(endDate);
        createdEndDate.setDate(createdEndDate.getDate() + 1);

        if (createdStartDate >= createdEndDate) {
          throw new BadRequestException(
            `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
          );
        }

        createdFindQuery = {
          ...createdFindQuery,
          createdAt: {
            $gte: createdStartDate,
            $lt: createdEndDate,
          },
        };

        deletedFindQuery = {
          ...deletedFindQuery,
          deletedAt: {
            $gte: createdStartDate,
            $lt: createdEndDate,
          },
          createdAt: {
            $gte: createdStartDate,
            $lt: createdEndDate,
          },
        };

        const pastCreatedFindQuery = {
          ...createdFindQuery,
          createdAt: {
            $lt: createdStartDate,
          },
        };

        const pastDeletedFindQuery = {
          ...deletedFindQuery,
          deletedAt: {
            $lt: createdStartDate,
          },
          createdAt: {
            $lt: createdStartDate,
          },
        };

        const [
          createdProducts,
          deletedProducts,
          prevCreatedProducts,
          prevDeletedProducts,
        ] = await Promise.all([
          queryhandler<Product>(this.ProductModel, {
            findQuery: createdFindQuery,
            select,
          }),
          queryhandler<Product>(this.ProductModel, {
            findQuery: deletedFindQuery,
            select,
          }),
          queryhandler<Product>(this.ProductModel, {
            findQuery: pastCreatedFindQuery,
            select,
          }),
          queryhandler<Product>(this.ProductModel, {
            findQuery: pastDeletedFindQuery,
            select,
          }),
        ]);

        const newProductCreated = createdProducts.totalData;
        const newProductDeleted = deletedProducts.totalData;
        const prevTotalProducts
          = prevCreatedProducts.totalData - prevDeletedProducts.totalData;

        return {
          newProductCreated,
          newProductDeleted,
          prevTotalProducts,
          isGrowth: newProductCreated - newProductDeleted > 0,
          growthPercentage: calculateGrowthPercentage(
            prevTotalProducts,
            newProductCreated,
          ),
        };
      }

      const [createdProduct, deletedProduct] = await Promise.all([
        queryhandler<Product>(this.ProductModel, {
          findQuery: createdFindQuery,
          select,
        }),
        queryhandler<Product>(this.ProductModel, {
          findQuery: deletedFindQuery,
          select,
        }),
      ]);
      const newProductCreated = createdProduct.totalData;
      const newProductDeleted = deletedProduct.totalData;

      return {
        newProductCreated,
        newProductDeleted,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
