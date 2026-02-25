/* eslint-disable no-undef */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';

import {
  BusinessStatus,
  GetBusinessByIdOrSlug,
} from 'src/modules/business/business.type';

import { BusinessesAudit } from '../schema/businesses-audit.schema';
import { Locale } from 'src/common/enum';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
  ) {}

  async getBusiness(command: GetBusinessByIdOrSlug) {
    const { id, locale } = command;

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
      const business = await this.BusinessesAuditModel.findOne({
        businessId: id,
        isActive: true,
        isDeleted: { $ne: true },
      })
        .select(select)
        .populate(populate)
        .lean();

      if (!business || business?.status !== BusinessStatus.APPROVED) {
        throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
      }
      const { businessId, ...rest } = business;

      const mappedData = {
        ...rest,
        _id: businessId,
      };

      const response = await this.localizeBusiness(mappedData, locale);

      return response;
    } catch (error) {
      if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
        const business = await this.BusinessesAuditModel.findOne({
          slug: id,
          isActive: true,
          isDeleted: { $ne: true },
        })
          .select(select)
          .populate(populate);

        if (!business || business?.status !== BusinessStatus.APPROVED) {
          throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
        }

        const { businessId, ...rest } = business;

        const mappedData = {
          ...rest,
          _id: businessId,
        };

        const response = await this.localizeBusiness(mappedData, locale);

        return response;
      }
      exceptionHandling(error);
    }
  }

  async findBusinessEmailByIds(ids: ObjectId[]) {
    try {
      const businessDetails = await this.BusinessesAuditModel.find({
        businessId: { $in: ids },
        isActive: true,
        isDeleted: { $ne: true },
      }).lean();

      const mappedBusiness = await Promise.all(
        businessDetails.map(async (business: any) => {
          const { businessId, ...rest } = (await business.toObject)
            ? business.toObject()
            : business;

          return {
            ...rest,
            _id: businessId,
          };
        }),
      );

      const response = await Promise.all(
        mappedBusiness.map(p => this.localizeBusiness(p, Locale.HEBREW)),
      );

      return response;
    } catch (error) {
      exceptionHandling(error);
    }
  }

  async localizeBusiness(business: any, locale: Locale, isSearch = false) {
    const {
      name,
      shortDescription,
      nameAr,
      shortDescriptionAr,
      nameHe,
      shortDescriptionHe,
      ...rest
    } = business;
    let nameField = 'nameHe';
    let shortDescField = 'shortDescriptionHe';

    if (locale === Locale.ARABIC) {
      nameField = 'nameAr';
      shortDescField = 'shortDescriptionAr';
    } else if (locale === Locale.ENGLISH) {
      nameField = 'name';
      shortDescField = 'shortDescription';
    }

    return {
      ...rest,
      name:
        business[nameField]
        || business.nameHe
        || business.name
        || business.nameAr,
      ...(isSearch
        ? {}
        : {
          shortDescription:
              business[shortDescField]
              || business.shortDescriptionHe
              || business.shortDescription
              || business.shortDescriptionAr,
        }),
    };
  }
}
