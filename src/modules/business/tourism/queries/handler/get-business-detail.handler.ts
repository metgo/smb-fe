import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ServerErrors } from 'src/common/constant';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetBusinessDetailForTourismQuery } from '../get-business-detail.query';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { BusinessService } from 'src/modules/business/shared/services/business.service';

@QueryHandler(GetBusinessDetailForTourismQuery)
export class GetBusinessDetailForTourismHandler
implements IQueryHandler<GetBusinessDetailForTourismQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    private readonly businessService: BusinessService,
  ) {}

  async execute(queries: GetBusinessDetailForTourismQuery): Promise<any> {
    try {
      const { slug, query } = queries;

      const select
        = '_id businessId dmoId authorityId location cover logo images name nameHe nameAr address countryCode phoneNumber busiEmail shortDescription description shortDescriptionHe descriptionHe shortDescriptionAr descriptionAr contactDetails geoLocation groupTypesId accessibilitiesId primaryCategoryId tagsId bussCategoriesId bussSubCategoriesId openingHrs isAlwaysOpen slug socialMedia impact deliveryArea deliverySpecificSellerInfo deliveryReturnExchange deliveryAdditionalInfo isPickUpAvailable';

      const populate = [
        {
          path: 'groupTypesId accessibilitiesId',
          select: '_id name hebrewName',
        },
        {
          path: 'tagsId',
          select: '_id name nameHe nameAr',
        },
        {
          path: 'socialMedia.socialMediaId',
          select: 'name',
        },
      ];

      try {
        const business = await this.BusinessesAuditModel.findOne({
          slug,
          status: CommonStatus.APPROVED,
          isActive: true,
        })
          .select(select)
          .lean()
          .populate(populate);

        if (!business) {
          throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
        }

        const { businessId, socialMedia, ...rest } = business;

        const mappedData = {
          ...rest,
          _id: businessId,
          socialMedia: (socialMedia ?? []).map(({ socialMediaId, url }: any) => ({
            ...(socialMediaId ?? {}),
            url,
          })),
        };

        const response = await this.businessService.localizeBusiness(
          mappedData,
          query.locale,
        );

        return response;
      } catch (error) {
        if (error?.name === 'CastError' && error?.kind === 'ObjectId') {
          throw new BadRequestException(
            `${error?.model?.modelName} ${ServerErrors.INVALID_ID}`,
          );
        }
        exceptionHandling(error);
      }
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
