/* eslint-disable no-undef */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import { ObjectId } from 'typeorm';

import { milesConfig, ServerErrors } from 'src/common/constant';
import { Image } from 'src/common/interface/image.interface';
import { maxDistanceInRadius } from 'src/common/max-distance-in-radius';
import { paginateData } from 'src/common/pagination';
import { paginationConfig } from 'src/common/pagination.config';
import { getNearestBusiness } from 'src/common/sort-by-nearest';
import { calculateGrowthPercentage } from 'src/common/utils/calculate-growth-percentage';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { generateRandomCode } from 'src/common/utils/randomCode.generator';
import { disSelect } from 'src/common/utils/select.handling';
import {
  deleteItem,
  findManyByFilter,
  findOneByFieldName,
  findOneByFieldNameExcludeId,
  findOneByFieldNameIncludingDeleted,
  findOneByFieldNames,
  queryhandler,
  updateManyByIds,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import { AuthorityService } from 'src/modules/authority/authority.service';
import {
  BusinessStatus,
  GetBusinessByIdOrSlug,
  GeoServicesTypes,
} from 'src/modules/business/business.type';
import {
  createBusinessDto,
  updateBusinessDto,
  WebCreateBusiness,
  UpdateBusinessByAdminDto,
} from 'src/modules/business/dto';
import {
  GetAllBusinessesForGuestQuery,
  GetAllUnpaginatedBusinessQuery,
  GetBusinessStatsQuery,
  GetUsersBusinessesQuery,
} from 'src/modules/business/queries';
import { Business } from 'src/modules/business/schema/business.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { Media } from 'src/modules/media/schema/media.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { UserType } from 'src/modules/users/users.type';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    private readonly authorityService: AuthorityService,
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
    @InjectModel('User')
    private UserModel: Model<User>,
  ) {}

  async createBusiness(
    dto: createBusinessDto,
    userId: string,
  ): Promise<Business> {
    let newDto: any = { ...dto, serviceType: GeoServicesTypes.BUSINESS };

    // find dmoId by authority
    if (dto.authorityId) {
      const dmo = (await this.authorityService.getOne(dto.authorityId)).dmoId;

      newDto = {
        ...newDto,
        dmoId: dmo._id,
      };
    }

    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [
          parseFloat(dto.geoLocation.long),
          parseFloat(dto.geoLocation.lat),
        ],
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

      await this.UserModel.findOneAndUpdate(
        { _id: userId },
        { hasBusiness: true },
      );
      return newBusiness;
    } catch (error) {
      if (this.isDuplicateKeyError(error, 'slug')) {
        const slug = this.generateSlug(`${dto?.name}${nanoid(2)}`);
        const newBusiness = new this.BusinessModel({
          ...newDto,
          userId,
          createdBy: userId,
          slug,
        });
        await newBusiness.save();

        await this.UserModel.findOneAndUpdate(
          { _id: userId },
          { hasBusiness: true },
        );
        return newBusiness;
      }
      exceptionHandling(error);
    }
  }

  async createBusinessByAdmins(
    dto: WebCreateBusiness,
    loggedInUser: LoggedInUserInterface,
    image: Array<Express.Multer.File>,
  ): Promise<Business> {
    let newDto: any = { ...dto, serviceType: GeoServicesTypes.BUSINESS };
    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [
          parseFloat(dto.geoLocation.long),
          parseFloat(dto.geoLocation.lat),
        ],
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

      let data = {
        ...newDto,
        images,
        createdBy: loggedInUser.id,
        slug,
      };
      if (loggedInUser.role === UserType.DMOADMIN) {
        const dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);

        data = {
          ...data,
          dmoId,
        };
      }
      const newBusiness = new this.BusinessModel(data);
      await newBusiness.save();

      // add to Media Table
      await Promise.all(
        newBusiness.images.map(async (img: any) => {
          const newMedia = new this.MediaModel({
            reference: {
              refId: newBusiness.id,
              schema: 'Business',
            },
            createdBy: loggedInUser.id,
            url: img.image,
            originalName: img?.caption || null,
            mimetype: img?.mimetype || null,
          });
          await newMedia.save();
        }),
      );

      return newBusiness;
    } catch (err) {
      if (this.isDuplicateKeyError(err, 'slug')) {
        const slug = this.generateSlug(`${dto?.name}${nanoid(2)}`);

        let data = {
          ...newDto,
          images,
          createdBy: loggedInUser.id,
          slug,
        };
        if (loggedInUser.role === UserType.DMOADMIN) {
          const dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);

          data = {
            ...data,
            dmoId,
          };
        }
        const newBusiness = new this.BusinessModel(data);
        await newBusiness.save();

        // add to Media Table
        await Promise.all(
          newBusiness.images.map(async (img: any) => {
            const newMedia = new this.MediaModel({
              reference: {
                refId: newBusiness.id,
                schema: 'Business',
              },
              createdBy: loggedInUser.id,
              url: img.image,
              originalName: img?.caption || null,
              mimetype: img?.mimetype || null,
            });
            await newMedia.save();
          }),
        );

        return newBusiness;
      }
      exceptionHandling(err);
    }
  }

  async getAllBusiness(
    queries: GetAllBusinessesForGuestQuery | GetUsersBusinessesQuery,
    authenticatedUser?: LoggedInUserInterface,
  ) {
    const {
      page, limit, search, long, lat, miles, ...query
    } = queries;

    const queryPage = Number(page) || paginationConfig.page;
    const queryLimit = Number(limit) || paginationConfig.limit;

    let findQuery: any = { ...query, serviceType: GeoServicesTypes.BUSINESS };

    if (!('status' in query) && !authenticatedUser) {
      findQuery = { ...findQuery, status: BusinessStatus.APPROVED };
    }

    if (authenticatedUser && authenticatedUser?.role === UserType.DMOADMIN) {
      const dmoId = await this.dmoService.findDMOByUserID(authenticatedUser.id);
      findQuery = {
        ...findQuery,
        dmoId,
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
      path: 'dmoId authorityId productsId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };

    const select = `${disSelect}`;

    if (search) {
      const [matchingCategoryIds, matchingSubCategoryIds] = await Promise.all([
        this.BussCategoryModel.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id'),
        this.BussSubCategoryModel.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id'),
      ]);

      const matchingProductsIds = await this.ProductModel.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { categories: { $in: matchingCategoryIds } },
          { subCategories: { $in: matchingSubCategoryIds } },
        ],
      }).select('_id');

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

      if (
        !(
          matchingCategoryIds?.length
          || matchingSubCategoryIds?.length
          || matchingProductsIds?.length
        )
      ) {
        findQuery.$text = {
          $search: search,
          $caseSensitive: false,
          $diacriticSensitive: false,
        };
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

      const allBusiness = await queryhandler<Business>(this.BusinessModel, {
        findQuery,
        select,
        populate,
        populate1,
        sort: 'createdAt',
      });

      const sortBusiness = getNearestBusiness(
        parseFloat(lat),
        parseFloat(long),
        allBusiness.data,
      );

      const allPaginatedBusinesses = paginateData(
        queryPage,
        queryLimit,
        sortBusiness,
      );

      return allPaginatedBusinesses;
    }

    const allBusiness = await queryhandler<Business>(this.BusinessModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
      sort: 'createdAt',
    });

    return allBusiness;
  }

  async getAllUnpaginatedBusiness(queries: GetAllUnpaginatedBusinessQuery) {
    const {
      search, long, lat, miles, ...query
    } = queries;

    let findQuery: any = {
      ...query,
      status: BusinessStatus.APPROVED,
      serviceType: GeoServicesTypes.BUSINESS,
    };

    if (search) {
      const [matchingCategoryIds, matchingSubCategoryIds] = await Promise.all([
        this.BussCategoryModel.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id'),
        this.BussSubCategoryModel.find({
          name: { $regex: search, $options: 'i' },
        }).select('_id'),
      ]);

      const matchingProductsIds = await this.ProductModel.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { categories: { $in: matchingCategoryIds } },
          { subCategories: { $in: matchingSubCategoryIds } },
        ],
      }).select('_id');

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

      if (
        !(
          matchingCategoryIds?.length
          || matchingSubCategoryIds?.length
          || matchingProductsIds?.length
        )
      ) {
        findQuery.$text = {
          $search: search,
          $caseSensitive: false,
          $diacriticSensitive: false,
        };
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
      path: 'dmoId authorityId productsId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };

    const select = `${disSelect}`;

    const allBusiness = await queryhandler<Business>(this.BusinessModel, {
      findQuery,
      select,
      populate,
      populate1,
    });

    return allBusiness;
  }

  async getBusiness(command: GetBusinessByIdOrSlug) {
    const { id, loggedInUser } = command;
    const populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    const populate1 = {
      path: 'dmoId authorityId productsId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };
    const select = `${disSelect}`;

    try {
      const business = await this.BusinessModel.findById(id)
        .select(select)
        .populate(populate)
        .populate(populate1);

      if (!business) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      if (
        !loggedInUser
        && business.status === BusinessStatus.APPROVED
        && !business.isDeleted
      ) {
        return business;
      }

      if (loggedInUser) {
        if (
          loggedInUser.role === UserType.SUPERADMIN
          || business.userId.equals(new mongoose.Types.ObjectId(loggedInUser.id))
        ) {
          return business;
        }

        if (loggedInUser.role === UserType.DMOADMIN && business?.dmoId) {
          const dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);
          if (business.dmoId.equals(new mongoose.Types.ObjectId(dmoId))) {
            return business;
          }
        }
      }

      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        if (error?.model?.modelName === Business.name) {
          const business = await findOneByFieldNameIncludingDeleted<Business>(
            this.BusinessModel,
            'slug',
            id,
          );
          if (!business) {
            throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
          }

          if (
            !loggedInUser
            && business.status === BusinessStatus.APPROVED
            && !business.isDeleted
          ) {
            return business;
          }

          if (loggedInUser) {
            if (
              loggedInUser.role === UserType.SUPERADMIN
              || business.userId.equals(
                new mongoose.Types.ObjectId(loggedInUser.id),
              )
            ) {
              return business;
            }

            if (loggedInUser.role === UserType.DMOADMIN && business.dmoId) {
              const dmoId = await this.dmoService.findDMOByUserID(
                loggedInUser.id,
              );
              if (business.dmoId.equals(new mongoose.Types.ObjectId(dmoId))) {
                return business;
              }
            }
          }

          throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
        }
        throw new BadRequestException(
          `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      exceptionHandling(error);
    }
  }

  async getAllMyBusiness(queries: GetUsersBusinessesQuery, userId: string) {
    const {
      page, limit, search, ...query
    } = queries;

    const queryPage = page ? Number(page) : paginationConfig.page;
    const queryLimit = limit ? Number(limit) : paginationConfig.limit;

    let findQuery: any = {
      ...query,
      userId,
      serviceType: GeoServicesTypes.BUSINESS,
    };
    if (search) {
      findQuery = {
        ...query,
        $text: {
          $search: search,
          $caseSensitive: false,
          $diacriticSensitive: false,
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
      path: 'dmoId authorityId productsId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };
    const select = `${disSelect}`;
    const allBusiness = await queryhandler<Business>(this.BusinessModel, {
      findQuery,
      select,
      page: queryPage,
      limit: queryLimit,
      populate,
      populate1,
    });

    return allBusiness;
  }

  async updateBusiness(
    id: string,
    loggedInUser: LoggedInUserInterface,
    dto: updateBusinessDto,
  ): Promise<Business> {
    let updatedField: any = {
      ...dto,
      updatedAt: new Date(),
      updatedBy: loggedInUser.id,
    };

    // find dmoId by authority
    if (dto?.authorityId) {
      const dmo = (await this.authorityService.getOne(dto.authorityId)).dmoId;

      updatedField = {
        ...updatedField,
        dmoId: dmo._id,
      };
    }

    if (dto.geoLocation) {
      const location = {
        type: 'Point',
        coordinates: [
          parseFloat(dto.geoLocation.long),
          parseFloat(dto.geoLocation.lat),
        ],
      };
      updatedField = {
        ...updatedField,
        location,
      };
    }

    if (dto.name) {
      const slug = this.generateSlug(dto.name);
      updatedField = {
        ...updatedField,
        slug,
      };
    }

    const updateBusiness = await this.BusinessModel.findOneAndUpdate(
      { _id: id, isDeleted: false, serviceType: GeoServicesTypes.BUSINESS },
      updatedField,
      { new: true },
    );
    if (!updateBusiness) {
      throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
    }
    return updateBusiness;
  }

  async updateBusinessByAdmin(
    id: string,
    loggedInUser: LoggedInUserInterface,
    body: UpdateBusinessByAdminDto,
  ): Promise<Business> {
    try {
      let updatedField: any = {
        ...body,
        updatedAt: new Date(),
        updatedBy: loggedInUser.id,
      };

      if (body.geoLocation) {
        const location = {
          type: 'Point',
          coordinates: [
            parseFloat(body.geoLocation.long),
            parseFloat(body.geoLocation.lat),
          ],
        };
        updatedField = {
          ...updatedField,
          location,
        };
      }

      // find dmoId by authority
      if (body?.authorityId) {
        const dmo = (await this.authorityService.getOne(body.authorityId))
          .dmoId;

        updatedField = {
          ...updatedField,
          dmoId: dmo._id,
        };
      }

      if (body.name) {
        const slug = this.generateSlug(body.name);
        updatedField = {
          ...updatedField,
          slug,
        };
      }

      let findQuery: any = {
        _id: id,
        $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
        serviceType: GeoServicesTypes.BUSINESS,
      };
      if (loggedInUser.role === UserType.DMOADMIN) {
        const dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);

        findQuery = {
          ...findQuery,
          dmoId,
        };
      }

      const updateBusiness = await this.BusinessModel.findOneAndUpdate(
        findQuery,
        updatedField,
        { new: true },
      );
      if (!updateBusiness) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }
      return updateBusiness;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async assignUsertoBusinesses(ids: mongoose.Types.ObjectId[], userId: string) {
    try {
      const updateBusiness = await updateManyByIds<Business>(
        this.BusinessModel,
        '_id',
        ids,
        { userId },
      );

      if (!updateBusiness) {
        throw new BadRequestException(ServerErrors.BUSINESS_NOT_FOUND);
      }
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async uploadMedia(
    id: string,
    loggedInUserId: string,
    dto: Image[],
    role: string,
  ) {
    const updatedField = {
      updatedBy: loggedInUserId,
      updatedAt: new Date(),
    };

    let updatedBusiness: mongoose.Document<unknown, {}, Business> &
      Business & {
        _id: mongoose.Types.ObjectId;
      };
    if (role === UserType.SUPERADMIN) {
      updatedBusiness = await updateOneByManyFields<Business>(
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
      updatedBusiness = await updateOneByManyFields<Business>(
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

  async deleteImage(
    loggedInUser: any,
    id: string,
    imageUrl: any,
  ): Promise<Business> {
    const existingBusiness = await this.getBusiness({
      id,
      loggedInUser,
    });

    const images = existingBusiness.images.filter(
      image => image.image !== imageUrl,
    );

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
    try {
      const updateField = { deletedBy: loggedInUserId };
      const business = await deleteItem<Business>(
        this.BusinessModel,
        { _id: id, serviceType: GeoServicesTypes.BUSINESS },
        updateField,
      );
      if (!business) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      const usersBusinesses = await findManyByFilter<Business>(
        this.BusinessModel,
        {
          userId: loggedInUserId,
          isDeleted: false,
        },
      );

      if (!usersBusinesses?.length) {
        await this.UserModel.findOneAndUpdate(
          { _id: loggedInUserId },
          { hasBusiness: false },
        );
      }
      return business;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async deleteBusinessByAdmin(
    id: string,
    loggedInUser: LoggedInUserInterface,
  ): Promise<Business> {
    try {
      const updateField = { deletedBy: loggedInUser.id };
      let filter: any = {
        _id: id,
      };

      if (loggedInUser.role === UserType.DMOADMIN) {
        const dmoId = await this.dmoService.findDMOByUserID(loggedInUser.id);
        filter = {
          ...filter,
          dmoId,
          serviceType: GeoServicesTypes.BUSINESS,
        };
      }

      const business = await deleteItem<Business>(
        this.BusinessModel,
        filter,
        updateField,
      );

      if (!business) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      const usersBusinesses = await findManyByFilter<Business>(
        this.BusinessModel,
        {
          userId: business.userId,
          isDeleted: false,
        },
      );

      if (!usersBusinesses?.length) {
        await this.UserModel.findOneAndUpdate(
          { _id: business.userId },
          { hasBusiness: false },
        );
      }

      return business;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findByFieldName(
    fieldName: keyof Business,
    items: string,
  ): Promise<boolean> {
    const bussEmail = await findOneByFieldName<Business>(
      this.BusinessModel,
      fieldName,
      items,
    );
    if (bussEmail) {
      throw new BadRequestException(`${fieldName} already exists`);
    }
    return false;
  }

  async findByFieldNameExcludeId(
    fieldName: keyof Business,
    items: string,
    id: string,
  ): Promise<boolean> {
    try {
      const bussEmail = await findOneByFieldNameExcludeId<Business>(
        this.BusinessModel,
        fieldName,
        items,
        id,
      );
      if (bussEmail) {
        throw new BadRequestException(`${fieldName} already exists`);
      }
      return false;
    } catch (err) {
      exceptionHandling(err);
    }
  }

  async findByFieldItems(fieldNames: object): Promise<Business> {
    const business = await findOneByFieldNames<Business>(
      this.BusinessModel,
      fieldNames,
    );

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
    try {
      const businessDetails = await this.BusinessModel.find({
        _id: { $in: ids },
      });

      return businessDetails;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async findManyByFieldIds(fieldName: keyof Business, ids: string[]) {
    const filterBy = { [fieldName]: { $in: ids } };
    const businesses = await this.BusinessModel.find(filterBy)
      .lean()
      .select('_id');
    const businessesId = businesses.map(item => item._id.toString());

    return businessesId;
  }

  async getStats(
    loggedInUser: LoggedInUserInterface,
    query: GetBusinessStatsQuery,
  ) {
    try {
      const {
        startDate, endDate, categoriesId, dmoId,
      } = query;

      const select = disSelect;

      let findQuery: any = {
        status: BusinessStatus.APPROVED,
        serviceType: GeoServicesTypes.BUSINESS,
      };

      if (categoriesId) {
        const bussCategoriesId = Array.isArray(categoriesId)
          ? categoriesId
          : [categoriesId];

        findQuery = {
          ...findQuery,
          bussCategoriesId: { $in: bussCategoriesId },
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
          createdBusinesses,
          deletedBusinesses,
          prevCreatedBusinesses,
          prevDeletedBusinesses,
        ] = await Promise.all([
          queryhandler<Business>(this.BusinessModel, {
            findQuery: createdFindQuery,
            select,
          }),
          queryhandler<Business>(this.BusinessModel, {
            findQuery: deletedFindQuery,
            select,
          }),
          queryhandler<Business>(this.BusinessModel, {
            findQuery: pastCreatedFindQuery,
            select,
          }),
          queryhandler<Business>(this.BusinessModel, {
            findQuery: pastDeletedFindQuery,
            select,
          }),
        ]);

        const newBusinessCreated = createdBusinesses.totalData;
        const newBusinessDeleted = deletedBusinesses.totalData;
        const prevTotalBusinesses
          = prevCreatedBusinesses.totalData - prevDeletedBusinesses.totalData;

        return {
          newBusinessCreated,
          newBusinessDeleted,
          prevTotalBusinesses,
          isGrowth: newBusinessCreated - newBusinessDeleted > 0,
          growthPercentage: calculateGrowthPercentage(
            prevTotalBusinesses,
            newBusinessCreated,
          ),
        };
      }

      const [createdBusinesses, deletedBusinesses] = await Promise.all([
        queryhandler<Business>(this.BusinessModel, {
          findQuery: createdFindQuery,
          select,
        }),
        queryhandler<Business>(this.BusinessModel, {
          findQuery: deletedFindQuery,
          select,
        }),
      ]);
      const newBusinessCreated = createdBusinesses.totalData;
      const newBusinessDeleted = deletedBusinesses.totalData;

      return {
        newBusinessCreated,
        newBusinessDeleted,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private generateSlug(name: string | null): string {
    return name
      ? `${name.replace(/ /g, '-').toLowerCase()}`
      : `${generateRandomCode(3).toLowerCase()}-${generateRandomCode(
        4,
      ).toLowerCase()}`;
  }

  private isDuplicateKeyError(error: any, fieldName: string): boolean {
    return (
      error.code === 11000
      && error?.keyPattern
      && error?.keyPattern[fieldName] === 1
    );
  }
}
