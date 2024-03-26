/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { ServerErrors } from 'src/common/constant';
import { paginationConfig } from 'src/common/pagination.config';
import { calculateGrowthPercentage } from 'src/common/utils/calculate-growth-percentage';
import { sellingPriceForAmountOrPercent } from 'src/common/utils/discount-calculation';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  deleteItem,
  findOneByIDPopulate,
  queryhandler,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { BusinessService } from 'src/modules/business/services/business.service';
import { BusinessStatus } from 'src/modules/business/business.type';
import { Business } from 'src/modules/business/schema/business.schema';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { Product } from 'src/modules/products/schema/products.schema';
import { CreateProductByAdmin, ProductDto } from 'src/modules/products/dto';
import {
  GetProductsQuery,
  UpdateProductsCommand,
  UploadMediaCommand,
} from 'src/modules/products/interface';
import { GetProductsStatsQuery } from 'src/modules/products/queries';
import { ProductStatus } from 'src/modules/products/products.type';
import { UserType } from 'src/modules/users/users.type';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    private readonly businessService: BusinessService,
    private readonly dmoService: DMOService,
    private readonly gcpBucketServices: GcpBucketService,
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

    const status
      = business.status !== BusinessStatus.APPROVED
      && body?.status === ProductStatus.ACTIVE
        ? ProductStatus.INACTIVE
        : body?.status || ProductStatus.ACTIVE;

    const createdField = {
      ...body,
      price,
      quantity,
      businessId,
      createdBy: userId,
      primaryUserId: business.userId,
      dmoId: business.dmoId,
      authorityId: business.authorityId,
      status,
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
    body: CreateProductByAdmin,
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

    const status
      = business.status !== BusinessStatus.APPROVED
      && body?.status === ProductStatus.ACTIVE
        ? ProductStatus.INACTIVE
        : body?.status || ProductStatus.ACTIVE;

    const images = [];
    await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        // store in gcp
        const imageUrl = await this.gcpBucketServices.upload(file);
        const imageObject = {
          image: imageUrl,
          caption: file.originalname,
          alt: file.originalname,
        };
        images.push(imageObject);
      }),
    );

    const createdField = {
      ...body,
      price,
      quantity,
      businessId,
      createdBy: loggedInUserId,
      primaryUserId: body?.userId || business?.userId || loggedInUserId,
      dmoId: business.dmoId,
      authorityId: business.authorityId,
      status,
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
      path: 'categories subCategories',
      select: `${disSelect}`,
    };
    try {
      const product = await findOneByIDPopulate<Product>(
        this.ProductModel,
        {
          _id: productId,
        },
        populate,
      );
      const allowedRoles = [UserType.DMOADMIN, UserType.SUPERADMIN];

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

      if (loggedInUser.role === UserType.DMOADMIN) {
        const dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);

        if (!product.dmoId.equals(new mongoose.Types.ObjectId(dmoId))) {
          throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
        }
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
    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

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

    if (queries.isAdmin && queries.loggedInUser.role === UserType.DMOADMIN) {
      const dmoId = await this.dmoService.findDMOByUserID(
        queries.loggedInUser.id,
      );

      findQuery = {
        ...findQuery,
        dmoId,
      };
    }

    const products = await queryhandler<Product>(this.ProductModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
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
      exceptionHandling(error);
    }
  }

  async update(command: UpdateProductsCommand): Promise<Product> {
    try {
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
        updatedBy: command.loggedInUser.id,
        updatedAt: new Date(),
        price,
        quantity,
      };

      let filterQuery: any = {
        _id: command.productId,
        businessId: command.businessId,
      };

      if (command.isAdmin && command.loggedInUser.role === UserType.DMOADMIN) {
        const dmoId = await this.dmoService.findDMOByUserID(
          command.loggedInUser.id,
        );
        filterQuery = {
          ...filterQuery,
          dmoId,
        };
      }

      if (!command.isAdmin) {
        filterQuery = {
          ...filterQuery,
          $or: [
            { primaryUserId: command.loggedInUser.id },
            { collaboratorId: command.loggedInUser.id },
          ],
        };
      }

      const updatedProduct = await updateOneByManyFields<Product>(
        this.ProductModel,
        filterQuery,
        updatedField,
      );

      if (!updatedProduct) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return updatedProduct;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async uploadMedia(command: UploadMediaCommand) {
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
    return updatedProduct;
  }

  async softDelete(
    businessId: string,
    productId: string,
    loggedInUser: LoggedInUserInterface,
    isAdmin?: boolean,
  ): Promise<Product> {
    try {
      let filterQuery: any = {
        _id: productId,
        businessId,
      };

      if (isAdmin && loggedInUser.role === UserType.DMOADMIN) {
        const dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);
        filterQuery = {
          ...filterQuery,
          dmoId,
        };
      }

      if (!isAdmin) {
        filterQuery = {
          ...filterQuery,
          $or: [
            { primaryUserId: loggedInUser.id },
            { collaboratorId: loggedInUser.id },
          ],
        };
      }

      const updatedField = { deletedBy: loggedInUser.id };

      const deletedProduct = await deleteItem<Product>(
        this.ProductModel,
        filterQuery,
        updatedField,
      );

      if (!deletedProduct) {
        throw new NotFoundException(ServerErrors.PRODUCT.NOT_FOUND);
      }

      return deletedProduct;
    } catch (err) {
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

  async getProductInformationForOrders(productInfo) {
    try {
      const ids = productInfo.map(item => item.id.toString());
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

  async findManyByFieldIds(fieldName: keyof Product, ids: string[]) {
    const filterBy = { [fieldName]: { $in: ids } };
    const businesses = await this.ProductModel.find(filterBy)
      .lean()
      .select('_id');
    const businessesId = businesses.map(item => item._id.toString());

    return businessesId;
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
        const dmoID = await this.dmoService.findDMOByUserID(loggedInUser.id);
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

        if (createdStartDate >= createdEndDate) {
          throw new BadRequestException(
            `Created ${ServerErrors.DATE_IS_NOT_LESS}`,
          );
        }

        createdFindQuery = {
          ...createdFindQuery,
          createdAt: {
            $gte: createdStartDate,
            $lte: createdEndDate,
          },
        };

        deletedFindQuery = {
          ...deletedFindQuery,
          deletedAt: {
            $gte: createdStartDate,
            $lte: createdEndDate,
          },
          createdAt: {
            $gte: createdStartDate,
            $lte: createdEndDate,
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
