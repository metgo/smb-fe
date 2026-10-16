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
import { sanitizeImages } from 'src/core/helper/image.util';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import { EventsAudit } from 'src/modules/events/schema/events-audit.schema';
import { PromotionOrdersService } from 'src/modules/promotion-orders/promotion-orders.service';

@QueryHandler(GetBusinessDetailForTourismQuery)
export class GetBusinessDetailForTourismHandler
implements IQueryHandler<GetBusinessDetailForTourismQuery> {
  constructor(
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    @InjectModel(Trip.name)
    private TripModel: Model<Trip>,
    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,
    private readonly businessService: BusinessService,
    private readonly promotionOrdersService: PromotionOrdersService,
  ) {}

  async execute(queries: GetBusinessDetailForTourismQuery): Promise<any> {
    try {
      const { slug, query } = queries;

      const select
        = '_id businessId primaryCategoryId location cover logo images name nameHe nameAr address countryCode phoneNumber busiEmail shortDescription description shortDescriptionHe descriptionHe shortDescriptionAr descriptionAr contactDetails geoLocation groupTypesId accessibilitiesId primaryCategoryId tagsId openingHrs isAlwaysOpen slug socialMedia impact deliveryArea deliverySpecificSellerInfo deliveryReturnExchange deliveryAdditionalInfo isPickUpAvailable';

      const populate = [
        {
          path: 'groupTypesId accessibilitiesId primaryCategoryId',
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
        const baseBusinessFilter = {
          slug,
          status: CommonStatus.APPROVED,
          isDeleted: { $ne: true },
        };

        // First try to find the latest audit doc with isActive: true
        let business = await this.BusinessesAuditModel.findOne({
          ...baseBusinessFilter,
          isActive: true,
        })
          .sort({ createdAt: -1 })
          .select(select)
          .lean()
          .populate(populate);

        // If no isActive doc found, fall back to the latest audit doc regardless of isActive
        if (!business) {
          business = await this.BusinessesAuditModel.findOne(baseBusinessFilter)
            .sort({ createdAt: -1 })
            .select(select)
            .lean()
            .populate(populate);
        }

        if (!business) {
          throw new NotFoundException(ServerErrors.BUSINESS_NOT_FOUND);
        }

        const { businessId, socialMedia, ...rest } = business;

        // Calculate hasProduct, hasTrips, hasEvents silently in backend only if isTravel is true
        let hasProducts = false;
        let hasTrips = false;
        let hasEvents = false;

        if (query.isTravel === true) {
          [hasProducts, hasTrips, hasEvents] = await Promise.all([
            this.ProductsAuditModel.countDocuments({
              businessId,
              isActive: true,
              isDeleted: { $ne: true },
            }).then(count => count > 0),
            this.TripModel.countDocuments({
              stations: {
                $elemMatch: {
                  _id: businessId,
                },
              },
              status: 'APPROVED',
              isDeleted: { $ne: true },
            }).then(count => count > 0),
            this.EventsAuditModel.countDocuments({
              businessId,
              isActive: true,
              isDeleted: { $ne: true },
              dayDescription: {
                $elemMatch: { date: { $gte: new Date() } },
              },
            }).then(count => count > 0),
          ]);
        }

        // Lion Coin badge per spec - from DB status, not manual. Single business lookup (no batching unlike listings).
        const [promotionStatus] = await this.promotionOrdersService.getStatusForBusinesses(
          [businessId.toString()],
        );

        const mappedData = {
          ...rest,
          _id: businessId,
          images: sanitizeImages(rest.images),
          logo:
            rest.logo != null ? sanitizeImages([rest.logo])[0] ?? null : null,
          socialMedia: (socialMedia ?? []).map(
            ({ socialMediaId, url }: any) => ({
              ...(socialMediaId ?? {}),
              url,
            }),
          ),
          hasProducts,
          hasTrips,
          hasEvents,
          isAlreadyRedeemed: promotionStatus?.status === 'REDEEMED',
        };

        const response = await this.businessService.localizeBusiness(
          mappedData,
          query.locale,
        );

        return response;
      } catch (error) {
        if (
          error
          && typeof error === 'object'
          && 'name' in error
          && error.name === 'CastError'
          && 'kind' in error
          && error.kind === 'ObjectId'
        ) {
          const modelName
            = 'model' in error
            && error.model
            && typeof error.model === 'object'
            && 'modelName' in error.model
              ? (error.model as any).modelName
              : '';
          throw new BadRequestException(
            `${modelName} ${ServerErrors.INVALID_ID}`,
          );
        }
        exceptionHandling(error);
      }
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
