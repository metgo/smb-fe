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
import { ServerErrors } from 'src/common/constant';
import { Image } from 'src/common/interface/image.interface';
import { paginationConfig } from 'src/common/pagination.config';
import { disSelect } from 'src/common/utils/select.handling';
import { BusinessStatus } from 'src/modules/business/business.type';
import { UpdateBusinessByAdminDto } from 'src/modules/business/dto/update-business-status.dto';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import { WebCreateBusiness } from 'src/modules/business/dto/web-create-business.dto';
import { Media } from '../media/schema/media.schema';
import { updateWebBusinessDto } from './dto/web.update.dto';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { UserType } from 'src/modules/users/users.type';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
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
    const newBusiness = new this.BusinessModel({
      ...newDto,
      userId,
      createdBy: userId,
    });
    await newBusiness.save();
    return newBusiness;
  }

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
    await Promise.all(
      image.map(async (file: Express.Multer.File) => {
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

    // const businessImageUrl = image ? await this.gcpBucketServices.upload(image) : null;

    // const images = [{
    //   image: businessImageUrl || null,
    //   caption: image?.originalname || null,
    //   alt: image?.originalname || null,
    // }];

    const newBusiness = new this.BusinessModel({
      ...newDto,
      images,
      createdBy: loggedInUserId,
    });
    await newBusiness.save();

    newBusiness.images.map(async (img: any) => {
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
    });

    return newBusiness;
  }

  async getAllBusiness(queries: FilterQuery | AllFilterQuery, isAdmin?: boolean) {
    const {
      page, limit, search, long, lat, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = query;

    if (!('status' in query) && !isAdmin) {
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
              maxDistanceInRadius,
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
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
    return allBusiness;
  }

  async getBusiness(id: string, loggedInUser: any) {
    const populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    // eslint-disable-next-line prefer-const
    const populate1 = {
      path: 'dmoId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };
    // eslint-disable-next-line prefer-const
    const select = `${disSelect}`;
    const business = await this.BusinessModel.findById(id).select(select).populate(populate).populate(populate1);

    console.log(business, loggedInUser);

    const allowedRoles = [UserType.ADMIN, UserType.SUPERADMIN, UserType.DMO];

    if (!business || (
      !(
        loggedInUser
        && (allowedRoles.includes(loggedInUser.role) || business.userId.equals(new mongoose.Types.ObjectId(loggedInUser.id)))
      ) && business.status !== BusinessStatus.APPROVED
    )) {
      console.log(loggedInUser);
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }

    return business;
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
      findQuery,
      select,
      queryPage,
      queryLimit,
      populate,
      populate1,
    );
    return allBusiness;
  }

  async updateBusiness(
    id: string,
    loggedInUser: any,
    dto: updateBusinessDto | UpdateBusinessByAdminDto | updateWebBusinessDto,
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

    const updateBusiness = await this.BusinessModel.findOneAndUpdate({ _id: id }, updatedField, { new: true });
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  async uploadMedia(id: string, loggedInUserId: string, dto: Image[]) {
    const updatedField = {
      updatedBy: loggedInUserId,
      updatedAt: new Date(),
    };

    const updatedBusiness = await updateWhere<Business>(
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

    if (!updatedBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updatedBusiness;
  }

  async deleteImage(loggedInUser: any, id: string, imageUrl: any): Promise<Business> {
    const existingBusiness = await this.getBusiness(id, loggedInUser);

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

  async deleteBusiness(id: string, loggedInUserId: string): Promise<Business> {
    const updateField = { isDeleted: true, deletedAt: new Date(), deletedBy: loggedInUserId };
    const business = await updateById<Business>(this.BusinessModel, id, updateField);
    if (!business) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return business;
  }

  async findByFieldName(fieldName: keyof Business, items: string): Promise<boolean> {
    const bussEmail = await findOneByFieldName<Business>(this.BusinessModel, fieldName, items);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(fieldName: keyof Business, items: string, id:string): Promise<boolean> {
    const bussEmail = await findOneByFieldNameExcludeId<Business>(this.BusinessModel, fieldName, items, id);
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
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

  async findBusinessEmailByIds(ids: ObjectId[]) {
    const bussEmails = await this.BusinessModel
      .find({ _id: { $in: ids } })
      .select('busiEmail');

    return bussEmails;
  }
}
