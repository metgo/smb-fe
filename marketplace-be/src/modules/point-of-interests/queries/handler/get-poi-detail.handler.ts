import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ServerErrors } from 'src/common/constant';
import { CommonStatus, Locale } from 'src/common/enum';
import { PointOfInterestsAudit } from '../../schema/point-of-interest-audit.schema';
import { GetPOIDetailQuery } from '../get-poi-detail.query';
import { sanitizeImages } from 'src/core/helper/image.util';

@QueryHandler(GetPOIDetailQuery)
export class GetPOIDetailHandler implements IQueryHandler<GetPOIDetailQuery> {
  constructor(
    @InjectModel(PointOfInterestsAudit.name)
    private PointOfInterestsAuditModel: Model<PointOfInterestsAudit>,
  ) {}

  async execute({ slug, query }: GetPOIDetailQuery): Promise<any> {
    try {
      const select
        = '_id pointOfInterestId dmoId authorityId location cover logo images name nameHe nameAr address countryCode phoneNumber busiEmail shortDescription description shortDescriptionHe descriptionHe shortDescriptionAr descriptionAr contactDetails geoLocation groupTypesId accessibilitiesId primaryCategoryId tagsId bussCategoriesId bussSubCategoriesId openingHrs isAlwaysOpen slug socialMedia impact deliveryArea deliverySpecificSellerInfo deliveryReturnExchange deliveryAdditionalInfo isPickUpAvailable';

      const populate = [
        {
          path: 'groupTypesId accessibilitiesId',
          select: '_id name hebrewName',
        },
        {
          path: 'tagsId',
          select: '_id name nameHe nameAr',
        },
      ];

      try {
        const poi = await this.PointOfInterestsAuditModel.findOne({
          slug,
          status: CommonStatus.APPROVED,
          isActive: true,
        })
          .select(select)
          .populate(populate)
          .lean();

        if (!poi) {
          throw new NotFoundException(ServerErrors.NOT_FOUND);
        }

        const { pointOfInterestId, ...rest } = poi;
        const mapped = { ...rest, _id: pointOfInterestId };

        return query.locale ? this.localize(mapped, query.locale) : mapped;
      } catch (error) {
        if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
          throw new BadRequestException(ServerErrors.INVALID_ID);
        }
        exceptionHandling(error);
      }
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private localize(poi: any, locale: string) {
    const {
      name,
      nameHe,
      nameAr,
      shortDescription,
      shortDescriptionHe,
      shortDescriptionAr,
      description,
      descriptionHe,
      descriptionAr,
      ...rest
    } = poi;

    switch (locale) {
      case Locale.ARABIC:
        return {
          ...rest,
          name: nameAr || name || nameHe,
          shortDescription:
            shortDescriptionAr || shortDescription || shortDescriptionHe,
          description: descriptionAr || description || descriptionHe,
          images: sanitizeImages(rest.images),
        };
      case Locale.HEBREW:
        return {
          ...rest,
          name: nameHe || name || nameAr,
          shortDescription:
            shortDescriptionHe || shortDescription || shortDescriptionAr,
          description: descriptionHe || description || descriptionAr,
          images: sanitizeImages(rest.images),
        };
      default:
        return {
          ...rest,
          name: name || nameHe || nameAr,
          shortDescription:
            shortDescription || shortDescriptionHe || shortDescriptionAr,
          description: description || descriptionHe || descriptionAr,
          images: sanitizeImages(rest.images),
        };
    }
  }
}
