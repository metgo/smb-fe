/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import {
  BadRequestException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { maxDistanceInRadius } from 'src/common/max-distance-in-radius';
import { Business } from './schema/business.schema';
import {
  AllFilterQuery, createBusinessDto, FilterQuery, updateBusinessDto,
} from 'src/modules/business/dto';
import {
  findOneByFieldName, findOneByFieldNameExcludeId, findOneByFieldNames, queryhandler, updateById, updateWhere,
} from 'src/core/helper/query-helper';
import { milesConfig, ServerErrors } from 'src/common/constant';
import { Image } from 'src/common/interface/image.interface';
import { paginationConfig } from 'src/common/pagination.config';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { disSelect } from 'src/common/utils/select.handling';
import { BusinessStatus, GetBusinessByIdOrSlug } from 'src/modules/business/business.type';
import { UpdateBusinessByAdminDto } from 'src/modules/business/dto/update-business-status.dto';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import { WebCreateBusiness } from 'src/modules/business/dto/web-create-business.dto';
import { GetAllUnpaginatedBusinessQuery } from 'src/modules/business/queries/get-all-unpaginated-business.query';
import { Media } from '../media/schema/media.schema';
import { updateWebBusinessDto } from './dto/web.update.dto';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { UserType } from 'src/modules/users/users.type';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { LoggedInUserInterface } from '../auth/interface/login.interface';
import { DMOService } from '../dmo/dmo.service';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    private readonly dmoService: DMOService,
    private readonly gcpBucketServices: GcpBucketService,
    @InjectModel('Media')
    private MediaModel: Model<Media>,
    @InjectModel(BussCategory.name)
    private BussCategoryModel: Model<BussCategory>,
    @InjectModel(BussSubCategory.name)
    private BussSubCategoryModel: Model<BussSubCategory>,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
  ) {}

  // eslint-disable-next-line consistent-return
  async createBusiness(dto: createBusinessDto, userId: string): Promise<Business> {
    let newDto:any = dto;
    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [parseFloat(dto.geoLocation.long), parseFloat(dto.geoLocation.lat)],
      };
      newDto = {
        ...newDto,
        location,
      };
    }
    try {
      const slug = this.generateSlug(dto?.name);
      const newBusiness = new this.BusinessModel({
        ...newDto,
        userId,
        createdBy: userId,
        slug,
      });
      await newBusiness.save();
      return newBusiness;
    } catch (error) {
      if (this.isDuplicateKeyError(error, 'slug')) {
        const slug = this.generateSlug(dto?.name);
        const newBusiness = new this.BusinessModel({
          ...newDto,
          userId,
          createdBy: userId,
          slug,
        });
        await newBusiness.save();
        return newBusiness;
      }
      exceptionHandling(error);
    }
  }

  // eslint-disable-next-line consistent-return
  async createBusinesForWeb(
    dto: WebCreateBusiness,
    loggedInUserId: string,
    image: Array<Express.Multer.File>,
  ): Promise<Business> {
    let newDto: any = dto;
    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [parseFloat(dto.geoLocation.long), parseFloat(dto.geoLocation.lat)],
      };
      newDto = {
        ...newDto,
        location,
      };
    }
    const images = [];
    // add to GCP
    await Promise.all(
      image.map(async (file: Express.Multer.File) => {
        const imageUrl = await this.gcpBucketServices.upload(file);

        const imageObject = {

          image: imageUrl || null,
          caption: file?.originalname || null,
          alt: file?.originalname || null,

        };
        images.push(imageObject);
      }),
    );

    try {
      const slug = this.generateSlug(dto?.name);
      const newBusiness = new this.BusinessModel({
        ...newDto,
        images,
        createdBy: loggedInUserId,
        slug,
      });
      await newBusiness.save();

      // add to Media Table
      await Promise.all(newBusiness.images.map(async (img: any) => {
        const newMedia = new this.MediaModel({
          reference: {
            refId: newBusiness.id,
            schema: 'Business',
          },
          createdBy: loggedInUserId,
          url: img.image,
          originalName: img?.caption || null,
          mimetype: img?.mimetype || null,
        });
        await newMedia.save();
      }));

      return newBusiness;
    } catch (err) {
      if (this.isDuplicateKeyError(err, 'slug')) {
        const slug = this.generateSlug(dto?.name);
        const newBusiness = new this.BusinessModel({
          ...newDto,
          images,
          createdBy: loggedInUserId,
          slug,
        });
        await newBusiness.save();

        // add to Media Table
        await Promise.all(newBusiness.images.map(async (img: any) => {
          const newMedia = new this.MediaModel({
            reference: {
              refId: newBusiness.id,
              schema: 'Business',
            },
            createdBy: loggedInUserId,
            url: img.image,
            originalName: img?.caption || null,
            mimetype: img?.mimetype || null,
          });
          await newMedia.save();
        }));

        return newBusiness;
      }
      exceptionHandling(err);
    }
  }

  async getAllBusiness(queries: FilterQuery | AllFilterQuery, isAdmin?: boolean) {
    const {
      page, limit, search, long, lat, miles, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = query;

    if (!('status' in query) && !isAdmin) {
      console.log(!('status' in query) && !isAdmin);
      findQuery = { ...query, status: BusinessStatus.APPROVED };
    }

    let select: {};

    let populate: any;
    let populate1: {};

    if (search) {
      const [matchingCategoryIds, matchingSubCategoryIds] = await Promise.all([
        this.BussCategoryModel.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
        this.BussSubCategoryModel.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
      ]);

      const matchingProductsIds = await this.ProductModel
        .find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { categories: { $in: matchingCategoryIds } },
            { subCategories: { $in: matchingSubCategoryIds } },
          ],
        })
        .select('_id');

      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { bussCategoriesId: { $in: matchingCategoryIds } },
          { bussSubCategoriesId: { $in: matchingSubCategoryIds } },
          { productsId: { $in: matchingProductsIds } },
        ],
      };

      if (!(matchingCategoryIds?.length || matchingSubCategoryIds?.length || matchingProductsIds?.length)) {
        findQuery.$text = { $search: search, $caseSensitive: false, $diacriticSensitive: false };
      }
    }

    if (query.bussCategoriesId) {
      const bussCategoriesId = JSON.parse(query.bussCategoriesId);
      findQuery = {
        ...findQuery,
        bussCategoriesId: { $in: bussCategoriesId },
      };
    }

    if (query.bussSubCategoriesId) {
      const bussSubCategoriesId = JSON.parse(query.bussSubCategoriesId);
      findQuery = {
        ...findQuery,
        bussSubCategoriesId: { $in: bussSubCategoriesId },
      };
    }

    if (query.accessibilitiesId) {
      const accessibilitiesId = JSON.parse(query.accessibilitiesId);
      findQuery = {
        ...findQuery,
        accessibilitiesId: { $in: accessibilitiesId },
      };
    }

    if (query.groupTypesId) {
      const groupTypesId = JSON.parse(query.groupTypesId);
      findQuery = {
        ...findQuery,
        groupTypesId: { $in: groupTypesId },
      };
    }

    if (long && lat) {
      // findQuery = {
      //   ...findQuery, // Filter out businesses without longitude data
      //   location: {
      //     $nearSphere: {
      //       $geometry: {
      //         type: 'Point',
      //         coordinates: [query.long, query.lat],
      //       },
      //       $minDistance: 1000,
      //       $maxDistance: 5000,
      //     },
      //   },
      // };

      findQuery = {
        ...findQuery, // Filter out businesses without longitude data
        location: {
          $geoWithin: {
            $centerSphere: [
              [long, lat],
              maxDistanceInRadius(miles || milesConfig),
            ],
          },
        },
      };
      // findQuery = {
      //   ...findQuery,
      //   location: {
      //     $near: {
      //       $geometry: {
      //         type: 'Point',
      //         coordinates: [query.long, query.lat],
      //       },
      //       $minDistance: 1000,
      //       $maxDistance: 5000,
      //     },
      //   },
      // };
    }

    // eslint-disable-next-line prefer-const
    populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    // eslint-disable-next-line prefer-const
    populate1 = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };

    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;

    const allBusiness = await queryhandler<Business>(
      this.BusinessModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
      },
    );

    return allBusiness;
  }

  async getAllUnpaginatedBusiness(queries: GetAllUnpaginatedBusinessQuery) {
    const {
      search, long, lat, miles, ...query
    } = queries;

    let findQuery: any = { ...query, status: BusinessStatus.APPROVED };

    if (search) {
      const [matchingCategoryIds, matchingSubCategoryIds] = await Promise.all([
        this.BussCategoryModel.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
        this.BussSubCategoryModel.find({ name: { $regex: search, $options: 'i' } }).select('_id'),
      ]);

      const matchingProductsIds = await this.ProductModel
        .find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { categories: { $in: matchingCategoryIds } },
            { subCategories: { $in: matchingSubCategoryIds } },
          ],
        })
        .select('_id');

      findQuery = {
        ...findQuery,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { bussCategoriesId: { $in: matchingCategoryIds } },
          { bussSubCategoriesId: { $in: matchingSubCategoryIds } },
          { productsId: { $in: matchingProductsIds } },
        ],
      };

      if (!(matchingCategoryIds?.length || matchingSubCategoryIds?.length || matchingProductsIds?.length)) {
        findQuery.$text = { $search: search, $caseSensitive: false, $diacriticSensitive: false };
      }
    }

    if (query.bussCategoriesId) {
      const bussCategoriesId = JSON.parse(query.bussCategoriesId);
      findQuery = {
        ...findQuery,
        bussCategoriesId: { $in: bussCategoriesId },
      };
    }

    if (query.bussSubCategoriesId) {
      const bussSubCategoriesId = JSON.parse(query.bussSubCategoriesId);
      findQuery = {
        ...findQuery,
        bussSubCategoriesId: { $in: bussSubCategoriesId },
      };
    }

    if (query.accessibilitiesId) {
      const accessibilitiesId = JSON.parse(query.accessibilitiesId);
      findQuery = {
        ...findQuery,
        accessibilitiesId: { $in: accessibilitiesId },
      };
    }

    if (query.groupTypesId) {
      const groupTypesId = JSON.parse(query.groupTypesId);
      findQuery = {
        ...findQuery,
        groupTypesId: { $in: groupTypesId },
      };
    }

    if (long && lat) {
      findQuery = {
        ...findQuery,
        location: {
          $geoWithin: {
            $centerSphere: [
              [long, lat],
              maxDistanceInRadius(miles || milesConfig),
            ],
          },
        },
      };
    }

    const populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    const populate1 = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };

    const select = `${disSelect}`;

    const allBusiness = await queryhandler<Business>(
      this.BusinessModel,
      {
        findQuery,
        select,
        populate,
        populate1,
      },
    );

    return allBusiness;
  }

  // eslint-disable-next-line consistent-return
  async getBusiness(command: GetBusinessByIdOrSlug) {
    const {
      id, loggedInUser,
    } = command;
    const populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    const populate1 = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };
    const select = `${disSelect}`;
    const allowedRoles = [UserType.ADMIN, UserType.SUPERADMIN, UserType.DMO];

    try {
      const business = await this.BusinessModel.findById(id).select(select).populate(populate).populate(populate1);

      if (!business || (
        !(
          loggedInUser
          && (allowedRoles.includes(loggedInUser.role)
          || business.userId.equals(new mongoose.Types.ObjectId(loggedInUser.id)))
        ) && business.status !== BusinessStatus.APPROVED
      )) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      return business;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        if (error?.model?.modelName === Business.name) {
          const business = await findOneByFieldName<Business>(this.BusinessModel, 'slug', id);
          if (!business || (
            !(
              loggedInUser
          && (allowedRoles.includes(loggedInUser.role)
          || business.userId.equals(new mongoose.Types.ObjectId(loggedInUser.id)))
            ) && business.status !== BusinessStatus.APPROVED
          )) {
            throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
          }

          return business;
        }
        throw new BadRequestException(`${error?.model?.modelName} ${ServerErrors.INVALID_ID}`);
      }
      exceptionHandling(error);
    }
  }

  async getAllMyBusiness(queries: AllFilterQuery, userId: string) {
    const {
      page, limit, search, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = { ...query, userId };
    let select: {};
    let populate: any;
    let populate1: {};
    if (search) {
      findQuery = {
        ...query,
        $text: { $search: search, $caseSensitive: false, $diacriticSensitive: false },
      };
    }
    // eslint-disable-next-line prefer-const
    populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    // eslint-disable-next-line prefer-const
    populate1 = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };
    // eslint-disable-next-line prefer-const
    select = `${disSelect}`;
    const allBusiness = await queryhandler<Business>(
      this.BusinessModel,
      {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        populate,
        populate1,
      },
    );

    return allBusiness;
  }

  // eslint-disable-next-line consistent-return
  async updateBusiness(
    id: string,
    loggedInUser: LoggedInUserInterface,
    dto: updateBusinessDto | UpdateBusinessByAdminDto | updateWebBusinessDto,
    isDMO?: boolean,
  ): Promise<Business> {
    let updatedField: any;
    let cordinates:any;
    if (dto instanceof updateBusinessDto && dto.geoLocation) {
      cordinates = {
        location: {
          coordinates: [parseFloat(dto.geoLocation.long), parseFloat(dto.geoLocation.lat)],
        },
      };
      updatedField = {
        ...dto,
        location: {
          type: 'Point',
          coordinates: cordinates.location.coordinates,
        },
      };
    }
    updatedField = {
      ...updatedField,
      ...dto,
      updatedAt: new Date(),
      updatedBy: loggedInUser.id,
    };

    let findQuery: any = {
      _id: id,
    };

    if (isDMO) {
      const dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);

      findQuery = {
        ...findQuery,
        dmoId,
      };
    }

    const updateBusiness = await this.BusinessModel.findOneAndUpdate(findQuery, updatedField, { new: true });
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  async uploadMedia(id: string, loggedInUserId: string, dto: Image[], role: string) {
    const updatedField = {
      updatedBy: loggedInUserId,
      updatedAt: new Date(),
    };

    let updatedBusiness:mongoose.Document<unknown, {}, Business> & Business & {
      _id: mongoose.Types.ObjectId
    };
    if (role === UserType.SUPERADMIN) {
      updatedBusiness = await updateWhere<Business>(
        this.BusinessModel,
        {
          _id: id,
        },
        {
          $push: { images: { $each: dto } },
          $set: updatedField,
        },
      );
    } else {
      updatedBusiness = await updateWhere<Business>(
        this.BusinessModel,
        {
          _id: id,
          userId: loggedInUserId,
        },
        {
          $push: { images: { $each: dto } },
          $set: updatedField,
        },
      );
    }

    if (!updatedBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updatedBusiness;
  }

  async deleteImage(loggedInUser: any, id: string, imageUrl: any): Promise<Business> {
    const existingBusiness = await this.getBusiness({
      id, loggedInUser,
    });

    const images = existingBusiness.images.filter(image => image.image !== imageUrl);

    const updateBusiness = await this.BusinessModel.findOneAndUpdate(
      { _id: id },
      { images, updatedAt: new Date(), updatedBy: loggedInUser.id },
      { new: true },
    );
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  // eslint-disable-next-line consistent-return
  async deleteBusiness(id: string, loggedInUserId: string): Promise<Business> {
    try {
      const updateField = { isDeleted: true, deletedAt: new Date(), deletedBy: loggedInUserId };
      const business = await updateById<Business>(this.BusinessModel, id, updateField);
      if (!business) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }
      return business;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findByFieldName(fieldName: keyof Business, items: string): Promise<boolean> {
    const bussEmail = await findOneByFieldName<Business>(this.BusinessModel, fieldName, items);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  // eslint-disable-next-line consistent-return
  async findByFieldNameExcludeId(fieldName: keyof Business, items: string, id:string): Promise<boolean> {
    try {
      const bussEmail = await findOneByFieldNameExcludeId<Business>(this.BusinessModel, fieldName, items, id);
      if (bussEmail) {
        throw new BadRequestException(`${fieldName} already exists`);
      }
      return false;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findByFieldItems(fieldNames: object): Promise<Business> {
    const business = await findOneByFieldNames<Business>(this.BusinessModel, fieldNames);

    return business;
  }

  async addProductToBusiness(id: string, productId: string) {
    return await this.BusinessModel.findOneAndUpdate(
      { _id: id },
      { $push: { productsId: productId } },
      { new: true },
    );
  }

  // eslint-disable-next-line consistent-return
  async findBusinessEmailByIds(ids: ObjectId[]) {
    try {
      const businessDetails = await this.BusinessModel.find({ _id: { $in: ids } });

      return businessDetails;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async findManyByFieldIds(fieldName: keyof Business, ids: string[]) {
    const filterBy = { [fieldName]: { $in: ids } };
    const businesses = await this.BusinessModel.find(filterBy).lean().select('_id');
    // eslint-disable-next-line no-underscore-dangle
    const businessesId = businesses.map(item => item._id.toString());

    return businessesId;
  }

  private generateSlug(name: string | null): string {
    return name ? `${name.replace(/ /g, '-').toLowerCase()}` : `${generateRandomCode(3).toLowerCase()}-${generateRandomCode(4).toLowerCase()}`;
  }

  private isDuplicateKeyError(error: any, fieldName: string): boolean {
    return error.code === 11000 && error?.keyPattern && error?.keyPattern[fieldName] === 1;
  }
}
