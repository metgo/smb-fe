/* eslint-disable no-undef */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { exceptionHandling } from 'src/common/utils/exception-handling';

import { BusinessesAudit } from '../schema/businesses-audit.schema';
import { Locale } from 'src/common/enum';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
  ) {}

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
      description,
      nameAr,
      shortDescriptionAr,
      descriptionAr,
      nameHe,
      shortDescriptionHe,
      descriptionHe,
      ...rest
    } = business;
    let nameField = 'nameHe';
    let shortDescField = 'shortDescriptionHe';
    let descField = 'descriptionHe';

    if (locale === Locale.ARABIC) {
      nameField = 'nameAr';
      shortDescField = 'shortDescriptionAr';
      descField = 'descriptionAr';
    } else if (locale === Locale.ENGLISH) {
      nameField = 'name';
      shortDescField = 'shortDescription';
      descField = 'description';
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
          description:
              business[descField]
              || business.descriptionHe
              || business.description
              || business.descriptionAr,
        }),
    };
  }
}
