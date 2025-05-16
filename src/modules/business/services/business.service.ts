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

import { ServerErrors } from 'src/common/constant';
import { deepEqual } from 'src/common/deepEqual';
import { Image } from 'src/common/interface/image.interface';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import {
  deleteItems,
  updateOneByManyFields,
} from 'src/core/helper/query-helper';
import {
  BusinessStatus,
  GetBusinessByIdOrSlug,
  GeoServicesTypes,
} from 'src/modules/business/business.type';

import { Business } from 'src/modules/business/schema/business.schema';
import { BusinessAudit } from 'src/modules/business/schema/business-audit.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { UserType } from 'src/modules/users/users.type';
import { ProductsService } from 'src/modules/products/products.services';

@Injectable()
export class BusinessService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('Business')
    private BusinessModel: Model<Business>,
    @InjectModel('BusinessAudit')
    private BusinessAuditModel: Model<BusinessAudit>,
    private readonly productService: ProductsService,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
  ) {}

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
