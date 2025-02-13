/* eslint-disable no-undef */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ObjectId } from 'typeorm';
import { Logger } from 'winston';

import { emailDefaultTemplate, ServerErrors } from 'src/common/constant';
import { deepEqual } from 'src/common/deepEqual';
import { Image } from 'src/common/interface/image.interface';
import { DynamicHebrewTemplate } from 'src/common/mailchimp/templateId';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { getRandomNumberBetween } from 'src/common/utils/random-number-range';
import { disSelect } from 'src/common/utils/select.handling';
import {
  deleteItems,
  queryhandler,
  updateById,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import { LoggedInUserInterface } from 'src/modules/auth/interface/login.interface';
import {
  BusinessStatus,
  GetBusinessByIdOrSlug,
  GeoServicesTypes,
} from 'src/modules/business/business.type';
import {
  GetAllUnpaginatedBusinessQuery,
  GetUsersBusinessesQuery,
} from 'src/modules/business/queries';
import { GetAllBusinessesForMapResponse } from 'src/modules/business/response/get-businesses-for-map.response';
import { Business } from 'src/modules/business/schema/business.schema';
import { BusinessAudit } from 'src/modules/business/schema/business-audit.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { DMOService } from 'src/modules/dmo/dmo.service';
import { Product } from 'src/modules/products/schema/products.schema';
import { User } from 'src/modules/users/schema/users.schema';
import { UserType } from 'src/modules/users/users.type';
import { ProductsService } from 'src/modules/products/products.services';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';

@Injectable()
export class BusinessService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    @InjectModel('BusinessAudit')
    private BusinessAuditModel: Model<BusinessAudit>,
    private readonly campaignService: CampaignService,
    private readonly dmoService: DMOService,
    private readonly productService: ProductsService,
    private readonly mailchimpService: MailChimpService,
    @InjectModel(BussCategory.name)
    private BussCategoryModel: Model<BussCategory>,
    @InjectModel(BussSubCategory.name)
    private BussSubCategoryModel: Model<BussSubCategory>,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
    @InjectModel('User')
    private UserModel: Model<User>,
  ) {}

  async seed() {
    const businesses = await this.BusinessModel.find();

    await Promise.all(
      businesses.map(async b => {
        const impact = getRandomNumberBetween(17, 93);
        await this.BusinessModel.updateOne(
          { _id: b.id },
          {
            $set: { impact },
          },
        );
      }),
    );
  }

  async syncSubcatWithCat() {
    const businesses = await this.BusinessModel.find();

    await Promise.all(
      businesses.map(async b => {
        let bussCategoriesId;

        await Promise.all(
          b.bussSubCategoriesId.map(async subCategory => {
            const subCatDetails = await this.BussSubCategoryModel.findById(
              subCategory,
            );
            const catId = subCatDetails?.bussCategoryId[0]?.toString();
            if (catId) {
              bussCategoriesId = bussCategoriesId?.length
                ? [...bussCategoriesId, catId]
                : [catId];
            }
          }),
        );

        const bussCat = [...new Set(bussCategoriesId)];

        await this.BusinessModel.updateOne(
          { _id: b.id },
          {
            $set: { bussCategoriesId: bussCat },
          },
        );
      }),
    );
  }

  async getAllBusinessesForMap(
    queries: GetUsersBusinessesQuery | GetAllUnpaginatedBusinessQuery,
    loggedInUser?: LoggedInUserInterface,
  ): Promise<GetAllBusinessesForMapResponse> {
    const {
      search,
      long,
      lat,
      miles,
      groupTypesId,
      accessibilitiesId,
      page,
      limit,
      ...query
    } = queries;

    let findQuery: any = {
      ...query,
    };

    if (!('status' in query)) {
      findQuery = { ...findQuery, status: BusinessStatus.APPROVED };
    }

    if (loggedInUser) {
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

      if (
        loggedInUser.role === UserType.AUTHORITY
        || loggedInUser.role === UserType.AUTHORITY_ADMIN
      ) {
        const authorityId = loggedInUser.authority.id;

        findQuery = {
          ...findQuery,
          authorityId,
        };
      }

      if (loggedInUser.role === UserType.TRAVELLER) {
        findQuery = {
          ...findQuery,
          userId: loggedInUser.id,
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

    const populate = {
      path: 'bussCategoriesId bussSubCategoriesId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    const populate1 = {
      path: 'dmoId authorityId',
      select: `${disSelect} -userId -collaboratorsUser`,
    };

    const select = `${disSelect}`;

    const allBusiness = await queryhandler<Business>(this.BusinessModel, {
      findQuery,
      select,
      populate,
      populate1,
    });

    const businessResponse = await Promise.all(
      allBusiness.data.map(business => ({
        _id: business._id,
        name: business?.name,
        description: business?.description,
        status: business?.status,
        authorityId: business?.authorityId,
        dmoId: business?.dmoId,
        geoLocation: business?.geoLocation,
        location: business?.location,
        bussCategoriesId: business?.bussCategoriesId,
        bussSubCategoriesId: business?.bussSubCategoriesId,
        serviceType: business?.serviceType,
      })),
    );

    allBusiness.data = businessResponse;

    return allBusiness;
  }

  async getBusiness(command: GetBusinessByIdOrSlug) {
    const { id } = command;

    const populate = {
      path: 'groupTypesId accessibilitiesId bussCategoriesId bussSubCategoriesId socialMedia.socialMediaId',
      select: `${disSelect}`,
      populate: {
        path: 'icon',
        select: `${disSelect}`,
      },
    };

    const select = `${disSelect}`;

    try {
      const business = await this.BusinessModel.findById(id)
        .select(select)
        .populate(populate);

      if (!business || business?.status !== BusinessStatus.APPROVED) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      return business;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        throw new BadRequestException(
          `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
        );
      }
      exceptionHandling(error);
    }
  }

  async assignUsertoBusinesses(
    businessIds: string[],
    assignUserId: string,
    loggedInUserId: string,
    user?: User,
  ) {
    try {
      const updatedField = { userId: assignUserId, updatedBy: loggedInUserId };
      const oldDataFForAudit = await this.BusinessModel.findById(
        businessIds[0],
      );
      const updateBusiness = await updateById<Business>(
        this.BusinessModel,
        businessIds[0],
        updatedField,
      );

      if (!updateBusiness) {
        throw new BadRequestException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      let assignedUser = user;
      if (!user) {
        assignedUser = await this.UserModel.findOneAndUpdate(
          { _id: assignUserId },
          { hasBusiness: true },
        );
      }

      const checkIfBusinessExists = await this.BusinessModel.findOne({
        userId: oldDataFForAudit?.userId,
        deletedAt: null,
        deletedBy: null,
        isDeleted: false,
      });

      if (!checkIfBusinessExists) {
        await this.UserModel.findOneAndUpdate(
          { _id: oldDataFForAudit?.userId },
          { hasBusiness: false },
        );
      }

      await this.productService.assignUserToProducts(
        businessIds,
        assignUserId,
        loggedInUserId,
      );

      const dmo = await this.dmoService.getById(updateBusiness.dmoId);

      const campaign: any
        = await this.campaignService.getOneCampaignDetailAssociatedToIds(
          updateBusiness.dmoId,
          'dmoIds',
        );

      // change previous assigned owner to traveller

      // email the users
      await this.mailchimpService.sendTransactionalEmail({
        to: assignedUser.email,
        templatedId: DynamicHebrewTemplate.TransferBusinessOwnership,
        mergeVars: {
          FNAME: assignedUser?.firstName,
          BUSINESSNAME: updateBusiness?.name,
          DMO: dmo?.name,
          LOGO1: dmo?.logoPath || emailDefaultTemplate.SIDE_LOGO,
          LOGO2: emailDefaultTemplate.MAIN_LOGO,
          LOGO3: campaign?.logoPath || emailDefaultTemplate.SIDE_LOGO,
          PRIMARY_BG_COLOR: emailDefaultTemplate.PRIMARY_BG_COLOR,
          PRIMARY_TEXT_COLOR: emailDefaultTemplate.PRIMARY_TEXT_COLOR,
          IMAGE1: emailDefaultTemplate.IMAGE1,
          IMAGE2: dmo?.imagePath || emailDefaultTemplate.IMAGE2,
          IMAGE3: campaign?.imagePath || emailDefaultTemplate.IMAGE3,
        },
      });

      this.logger.info('[BUSINESS]: ASSIGNED', { message: updateBusiness });

      await this.addToBusinessAuditTable(oldDataFForAudit, updateBusiness);

      return updateBusiness;
    } catch (err) {
      this.logger.error(
        `[BUSINESS]: FAILED TO ASSIGN businessIds:${businessIds}`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async uploadMedia(
    id: string,
    loggedInUserId: string,
    dto: Image[],
    role: string,
  ) {
    try {
      const updatedField = {
        updatedBy: loggedInUserId,
        updatedAt: new Date(),
      };

      let updatedBusiness: mongoose.Document<unknown, {}, Business> &
        Business & {
          _id: mongoose.Types.ObjectId;
        };

      const newImages = dto?.map(img => {
        if (img?.caption === 'metgoBusinessPrimaryImageIncoming.jpg') {
          return {
            ...img,
            isPrimary: true,
          };
        }
        return img;
      });

      const oldDataFForAudit = await this.BusinessModel.findById(id);

      if (role === UserType.SUPERADMIN) {
        updatedBusiness = await updateOneByManyFields<Business>(
          this.BusinessModel,
          {
            _id: id,
          },
          {
            $push: { images: { $each: newImages } },
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
            $push: { images: { $each: newImages } },
            $set: updatedField,
          },
        );
      }

      if (!updatedBusiness) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }

      this.logger.info(`[BUSINESS]: UPLOADED IMAGES for ${id}`);

      await this.addToBusinessAuditTable(oldDataFForAudit, updatedBusiness);

      return updatedBusiness;
    } catch (err) {
      this.logger.error(`[BUSINESS]: FAILED TO UPLOAD IMAGE businessId:${id}`, {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async uploadMediaByFieldName(
    id: string,
    loggedInUserId: string,
    dto: Image[],
    fieldName: string,
    role: string,
  ) {
    try {
      const updatedField = {
        updatedBy: loggedInUserId,
        updatedAt: new Date(),
        [fieldName]: dto[0],
      };

      let updatedBusiness;
      if (role === UserType.SUPERADMIN) {
        updatedBusiness = await this.BusinessModel.updateOne(
          {
            _id: id,
          },
          {
            $set: updatedField,
          },
        );
      } else {
        updatedBusiness = await this.BusinessModel.updateOne(
          {
            _id: id,
            userId: loggedInUserId,
          },
          {
            $set: updatedField,
          },
        );
      }

      this.logger.info(`[BUSINESS]: UPLOADED IMAGES for ${id}`);
      return updatedBusiness;
    } catch (err) {
      this.logger.error(`[BUSINESS]: FAILED TO UPLOAD IMAGE businessId:${id}`, {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  // async deleteImage(
  //   loggedInUser: any,
  //   id: string,
  //   imageUrl: any,
  //   businessImageType: string,
  // ): Promise<Business> {
  //   try {
  //     const existingBusiness = await this.getBusiness({
  //       id,
  //       loggedInUser,
  //     });

  //     let updatedField: any = {
  //       updatedAt: new Date(),
  //       updatedBy: loggedInUser.id,
  //     };

  //     if (businessImageType === 'logo') {
  //       updatedField = {
  //         ...updatedField,
  //         logo: null,
  //       };
  //     }
  //     if (businessImageType === 'cover') {
  //       updatedField = {
  //         ...updatedField,
  //         cover: null,
  //       };
  //     }
  //     if (businessImageType === 'images') {
  //       const images = existingBusiness?.images?.filter(
  //         image => image.image !== imageUrl,
  //       );

  //       updatedField = {
  //         ...updatedField,
  //         images,
  //       };
  //     }

  //     const updateBusiness = await this.BusinessModel.findOneAndUpdate(
  //       { _id: id },
  //       updatedField,
  //       { new: true },
  //     );
  //     if (!updateBusiness) {
  //       throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
  //     }

  //     this.logger.info(`[BUSINESS]: DELETED IMAGES for ${id}`);

  //     await this.addToBusinessAuditTable(existingBusiness, updateBusiness);

  //     return updateBusiness;
  //   } catch (err) {
  //     this.logger.error(`[BUSINESS]: FAILED TO DELETE IMAGE businessId:${id}`, {
  //       err: err.message,
  //     });
  //     exceptionHandling(err);
  //   }
  // }

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

  async deleteBusinessesPostUserDelete(userId: string, loggedInUserId: string) {
    const filter: any = {
      userId,
      serviceType: GeoServicesTypes.BUSINESS,
    };

    const businessesToBeUpdated = await this.BusinessModel.find(filter).select(
      '_id',
    );

    if (businessesToBeUpdated?.length) {
      const updateField = { deletedBy: loggedInUserId };
      const businessIds = businessesToBeUpdated.map(item => item._id);
      const filterProduct = {
        businessId: { $in: businessIds },
      };

      try {
        await deleteItems<Business>(this.BusinessModel, filter, updateField);

        // deleteProduct associated to these business;

        await deleteItems<Product>(
          this.ProductModel,
          filterProduct,
          updateField,
        );
      } catch (err) {
        exceptionHandling(err);
      }
    }
  }

  async recoverBusinessPostUserRecovery(userId: string) {
    const filter: any = {
      userId,
      serviceType: GeoServicesTypes.BUSINESS,
    };

    const businessesToBeRecovered = await this.BusinessModel.find(
      filter,
    ).select('_id');

    if (businessesToBeRecovered?.length) {
      const updateField = {
        deletedBy: null,
        deletedAt: null,
        isDeleted: false,
      };
      const businessIds = businessesToBeRecovered.map(item => item._id);

      const filterProduct = {
        businessId: { $in: businessIds },
      };

      try {
        await this.BusinessModel.updateMany(filter, updateField);

        // recover products associated to these business;
        await this.ProductModel.updateMany(filterProduct, updateField);
      } catch (err) {
        exceptionHandling(err);
      }
    }
  }

  private async addToBusinessAuditTable(oldDoc, newDoc) {
    this.logger.info('[BUSINESS HISTORY]: START TO ADD TO BUSINESS HISTORY');
    const changedFields = {};

    const newData = newDoc.toObject();
    const oldData = oldDoc.toObject();

    Object.entries(newData).forEach(([key, newValue]) => {
      if (key === 'updatedAt') {
        return;
      }
      const oldValue = oldData[key];

      if (!deepEqual(oldValue, newValue)) {
        changedFields[key] = { original: oldValue, updated: newValue };
      }
    });

    if (Object.keys(changedFields).length > 0) {
      const auditEntry = {
        businessId: newDoc._id,
        changedFields,
        updatedBy: newDoc.updatedBy,
        updatedAt: new Date(),
      };

      try {
        await this.BusinessAuditModel.create(auditEntry);
        this.logger.info('[BUSINESS HISTORY]: ADDED TO BUSINESS HISTORY', {
          auditEntry,
        });
      } catch (error) {
        this.logger.error(
          '[BUSINESS HISTORY]: FAILED TO ADD TO BUSINESS HISTORY',
          { err: error.message },
        );
        exceptionHandling(error);
      }
    }
  }
}
