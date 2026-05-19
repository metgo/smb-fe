import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetFiltersQuery } from '../get-filters.query';
import { ServicesTypes } from '../../dashboard.type';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import {
  GetAllFilterResponse,
  GetRawQueryResponse,
  ModelResponse,
  TopicWithCategories,
} from '../../response/get-all-filters.response';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { GetProductRawQuery } from '../get-product-raw-query.query';
import { GetBusinessRawQuery } from '../get-business-raw-query.query';
import { GetEventRawQuery } from '../get-event-raw-query.query';
import { GetTripRawQuery } from '../get-trip-raw-query.query';
import { GetPOIRawQuery } from '../get-poi-raw-query.query';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { EventsAudit } from 'src/modules/events/schema/events-audit.schema';
import { PointOfInterestsAudit } from 'src/modules/point-of-interests/schema/point-of-interest-audit.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { FindByIdAndPopulateQuery } from 'src/modules/campaign/queries/find-by-id-and-populate.query';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServerErrors } from 'src/common/constant';
import { SiteFiltersConfig } from 'src/modules/site-filters-config/schema/site-filters-config.schema';
import { SiteFiltersConfigStatus } from 'src/modules/site-filters-config/site-filters-config.type';

@QueryHandler(GetFiltersQuery)
export class GetFiltersHandler implements IQueryHandler<GetFiltersQuery> {
  constructor(
    private campaignService: CampaignService,

    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,

    @InjectModel(EventsAudit.name)
    private EventsAuditModel: Model<EventsAudit>,

    @InjectModel(PointOfInterestsAudit.name)
    private PointOfInterestsAuditModel: Model<PointOfInterestsAudit>,

    @InjectModel(Trip.name)
    private TripModel: Model<Trip>,

    @InjectModel(BussCategory.name)
    private CategoryModel: Model<BussCategory>,

    @InjectModel(Accessibility.name)
    private AccessibilityModel: Model<Accessibility>,

    @InjectModel(GroupType.name)
    private GroupTypeModel: Model<GroupType>,

    private readonly queryBus: QueryBus,

    @InjectModel(ExternalApi.name)
    private ExternalApiModel: Model<ExternalApi>,

    @InjectModel(SiteFiltersConfig.name)
    private SiteFiltersConfigModel: Model<SiteFiltersConfig>,

    @InjectModel(Tags.name)
    private TagsModel: Model<Tags>,

    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
  ) {}

  async execute(queries: GetFiltersQuery): Promise<GetAllFilterResponse> {
    try {
      const {
        identifierId,
        campCode,
        categoriesId,
        subCategoriesId,
        groupTypesId,
        accessibilitiesId,
        serviceType,
      } = queries.body;

      if (!identifierId && !campCode) {
        throw new BadRequestException('Please enter identifierId or campcode');
      }

      let campDetails;
      let topics: TopicWithCategories[] = [];

      if (identifierId) {
        const externalApi = await this.ExternalApiModel.findOne({
          identifierId,
        }).select('_id primaryCampIds');

        if (!externalApi) {
          throw new NotFoundException(`SITE ${ServerErrors.NOT_FOUND}`);
        }

        // need to add if multiple primary campId exists
        campDetails = await this.queryBus.execute(
          new FindByIdAndPopulateQuery(externalApi.primaryCampIds[0]),
        );

        const siteSettings = await this.SiteFiltersConfigModel.findOne({
          externalApiId: externalApi._id,
          status: SiteFiltersConfigStatus.APPROVED,
        })
          .select('siteTopics')
          .lean();

        topics = (siteSettings?.siteTopics || [])
          .filter(t => !t.isArchived)
          .map(t => ({
            name: t.titleHe || t.title || t.titleAr,
            categories: (t.siteCategories || [])
              .filter(cat => !cat.isArchived)
              .map(cat => cat.titleHe || cat.title || cat.titleAr)
              .filter(Boolean),
          }))
          .filter(t => Boolean(t.name));

        if (!topics.length) {
          const campOrConditions: any[] = [];
          if (campDetails?.productIds?.length) {
            campOrConditions.push({
              productId: { $in: campDetails.productIds },
            });
          }
          if (campDetails?.dmoIds?.length) {
            campOrConditions.push({ dmoId: { $in: campDetails.dmoIds } });
          }
          if (campDetails?.authorityIds?.length) {
            campOrConditions.push({
              authorityId: { $in: campDetails.authorityIds },
            });
          }
          if (campDetails?.businessIds?.length) {
            campOrConditions.push({
              businessId: { $in: campDetails.businessIds },
            });
          }

          const productFilter: any = {
            status: CommonStatus.APPROVED,
            isActive: true,
            isDeleted: { $ne: true },
            $and: [
              {
                $or: [
                  { 'quantity.remaining': { $gt: 0 } },
                  { 'quantity.isUnlimited': true },
                ],
              },
            ],
          };

          if (campOrConditions.length) {
            productFilter.$and.push({ $or: campOrConditions });
          }

          const distinctCategoryIds = await this.ProductsAuditModel.distinct(
            'primaryCategoryId',
            productFilter,
          );

          if (distinctCategoryIds.length) {
            const primaryCategories = await this.CategoryModel.find({
              _id: { $in: distinctCategoryIds },
            })
              .select('name hebrewName')
              .lean();

            topics = primaryCategories
              .map(cat => ({
                name: cat.hebrewName || cat.name,
                categories: [],
              }))
              .filter(t => Boolean(t.name));
          }
        }
      }

      if (campCode) {
        campDetails = await this.campaignService.findCampaignAndReturn(
          'code',
          campCode,
        );
      }

      // eslint-disable-next-line no-nested-ternary
      const finalServiceType = serviceType
        ? Array.isArray(serviceType)
          ? serviceType
          : [serviceType]
        : [];

      const hasBusinessSpecificFilters
        = !!categoriesId
        || !!subCategoriesId
        || !!accessibilitiesId
        || !!groupTypesId;

      if (hasBusinessSpecificFilters) {
        if (!finalServiceType.includes(ServicesTypes.BUSINESS)) {
          finalServiceType.push(ServicesTypes.BUSINESS);
        }
      }

      const hasServiceFilter
        = Array.isArray(finalServiceType) && finalServiceType.length > 0;

      const listOfCategoriesIds = [];
      const listOfSubCategoriesIds = [];
      const listOfAccessibilityIds = [];
      const listOfGroupTypeIds = [];

      const wantsBusiness
        = !hasServiceFilter || finalServiceType.includes(ServicesTypes.BUSINESS);

      const wantsPOI
        = !hasServiceFilter
        || finalServiceType.includes(ServicesTypes.POINT_OF_INTEREST);

      const wantsEvents
        = !hasServiceFilter || finalServiceType.includes(ServicesTypes.EVENT);

      const wantsTripsOrFunday
        = !hasServiceFilter
        || finalServiceType.some(t => [ServicesTypes.TRIPS, ServicesTypes.FUNDAY].includes(t));

      if (wantsBusiness) {
        const ids = await this.getBusinessOrPoi(queries, campDetails);
        this.mergeDistincts(ids, {
          listOfCategoriesIds,
          listOfSubCategoriesIds,
          listOfAccessibilityIds,
          listOfGroupTypeIds,
        });
      }

      if (wantsPOI) {
        const ids = await this.getPoi(queries, campDetails);
        this.mergeDistincts(ids, {
          listOfCategoriesIds,
          listOfSubCategoriesIds,
          listOfAccessibilityIds,
          listOfGroupTypeIds,
        });
      }

      if (wantsEvents) {
        const ids = await this.getEvents(queries, campDetails);
        this.mergeDistincts(ids, {
          listOfCategoriesIds,
          listOfSubCategoriesIds,
          listOfAccessibilityIds,
          listOfGroupTypeIds,
        });
      }

      if (wantsTripsOrFunday) {
        const ids = await this.getTrip(campDetails, finalServiceType);
        this.mergeDistincts(ids, {
          listOfCategoriesIds,
          listOfSubCategoriesIds,
          listOfAccessibilityIds,
          listOfGroupTypeIds,
        });
      }

      const cleanedCategories = this.cleanIds(listOfCategoriesIds);
      const cleanedAccessibilities = this.cleanIds(listOfAccessibilityIds);
      const cleanedGroupTypes = this.cleanIds(listOfGroupTypeIds);

      const productRawQuery = await this.queryBus.execute(
        new GetProductRawQuery({
          categoriesId,
          subCategoriesId,
          groupTypesId,
          accessibilitiesId,
          campDetails,
          search: queries.body.search,
        }),
      );

      const distinctTagIds: any[] = productRawQuery
        ? await this.getDistincts(
          this.ProductsAuditModel,
          'tagsId',
          productRawQuery.findQuery,
        )
        : [];

      const cleanedTagIds = this.cleanIds(distinctTagIds);

      const [categories, accessibilities, groupTypes, tags] = await Promise.all(
        [
          this.getCategories({ _id: { $in: cleanedCategories } }),
          this.getAccessibilities({ _id: { $in: cleanedAccessibilities } }),
          this.getGroupTypes({ _id: { $in: cleanedGroupTypes } }),
          this.getTags({ _id: { $in: cleanedTagIds } }),
        ],
      );

      return {
        accessibilities,
        categories,
        groupTypes,
        tags,
        topics,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getBusinessOrPoi(
    queries: GetFiltersQuery,
    campDetails: any,
  ): Promise<GetRawQueryResponse> {
    try {
      const {
        categoriesId,
        subCategoriesId,
        groupTypesId,
        accessibilitiesId,
        search,
      } = queries.body;

      const { findQuery } = await this.queryBus.execute(
        new GetBusinessRawQuery({
          categoriesId,
          subCategoriesId,
          accessibilitiesId,
          groupTypesId,
          campDetails,
          search,
        }),
      );

      const [
        accessibilitiesIds,
        groupTypesIds,
        categoriesIds,
        subCategoriesIds,
      ] = await Promise.all([
        this.getDistincts(this.BusinessesAuditModel, 'accessibilitiesId', {
          ...findQuery,
          isActive: true,
        }),
        this.getDistincts(this.BusinessesAuditModel, 'groupTypesId', {
          ...findQuery,
          isActive: true,
        }),
        this.getDistincts(this.BusinessesAuditModel, 'bussCategoriesId', {
          ...findQuery,
          isActive: true,
        }),
        this.getDistincts(this.BusinessesAuditModel, 'bussSubCategoriesId', {
          ...findQuery,
          isActive: true,
        }),
      ]);

      return {
        accessibilitiesIds,
        groupTypesIds,
        categoriesIds,
        subCategoriesIds,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getPoi(
    queries: GetFiltersQuery,
    campDetails: any,
  ): Promise<GetRawQueryResponse> {
    try {
      const { search } = queries.body;

      const result = await this.queryBus.execute(
        new GetPOIRawQuery({ campDetails, search }),
      );

      if (!result) {
        return {
          accessibilitiesIds: [],
          groupTypesIds: [],
          categoriesIds: [],
          subCategoriesIds: [],
        };
      }

      const { findQuery } = result;

      const [
        accessibilitiesIds,
        groupTypesIds,
        categoriesIds,
        subCategoriesIds,
      ] = await Promise.all([
        this.getDistincts(
          this.PointOfInterestsAuditModel,
          'accessibilitiesId',
          {
            ...findQuery,
            isActive: true,
          },
        ),
        this.getDistincts(this.PointOfInterestsAuditModel, 'groupTypesId', {
          ...findQuery,
          isActive: true,
        }),
        this.getDistincts(this.PointOfInterestsAuditModel, 'bussCategoriesId', {
          ...findQuery,
          isActive: true,
        }),
        this.getDistincts(
          this.PointOfInterestsAuditModel,
          'bussSubCategoriesId',
          {
            ...findQuery,
            isActive: true,
          },
        ),
      ]);

      return {
        accessibilitiesIds,
        groupTypesIds,
        categoriesIds,
        subCategoriesIds,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getEvents(
    queries: GetFiltersQuery,
    campDetails: any,
  ): Promise<GetRawQueryResponse> {
    try {
      const { search } = queries.body;

      const findQuery = await this.queryBus.execute(
        new GetEventRawQuery({
          campDetails,
          search,
        }),
      );

      const [
        accessibilitiesIds,
        groupTypesIds,
        categoriesIds,
        subCategoriesIds,
      ] = await Promise.all([
        this.getDistincts(this.EventsAuditModel, 'accessibilitiesId', {
          ...findQuery,
          isActive: true,
        }),
        this.getDistincts(this.EventsAuditModel, 'groupTypesId', {
          ...findQuery,
          isActive: true,
        }),
        this.getDistincts(this.EventsAuditModel, 'bussCategoriesId', {
          ...findQuery,
          isActive: true,
        }),
        this.getDistincts(this.EventsAuditModel, 'subCategoriesId', {
          ...findQuery,
          isActive: true,
        }),
      ]);

      return {
        accessibilitiesIds,
        groupTypesIds,
        categoriesIds,
        subCategoriesIds,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async getTrip(
    campDetails: any,
    serviceType: ServicesTypes[],
  ): Promise<GetRawQueryResponse> {
    try {
      const matchQuery = await this.queryBus.execute(
        new GetTripRawQuery({
          campDetails,
          serviceType,
        }),
      );

      // search not implemented

      const [
        accessibilitiesIds,
        groupTypesIds,
        categoriesIds,
        subCategoriesIds,
      ] = await Promise.all([
        this.getDistincts(this.TripModel, 'accessibilitiesId', matchQuery),
        this.getDistincts(this.TripModel, 'groupTypesId', matchQuery),
        this.getDistincts(this.TripModel, 'categoriesId', matchQuery),
        this.getDistincts(this.TripModel, 'subCategoriesId', matchQuery),
      ]);

      return {
        accessibilitiesIds,
        groupTypesIds,
        categoriesIds,
        subCategoriesIds,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private mergeDistincts(from, target) {
    if (!from) return;
    target.listOfCategoriesIds.push(...from.categoriesIds);
    target.listOfSubCategoriesIds.push(...from.subCategoriesIds);
    target.listOfAccessibilityIds.push(...from.accessibilitiesIds);
    target.listOfGroupTypeIds.push(...from.groupTypesIds);
  }

  private cleanIds(arr: any[]): Types.ObjectId[] {
    if (!Array.isArray(arr)) return [];

    return arr
      .map(val => {
        if (!val) return null;

        if (typeof val === 'string') {
          return new mongoose.Types.ObjectId(val);
        }

        if (val instanceof mongoose.Types.ObjectId) {
          return val;
        }

        if (val.$oid) {
          return new mongoose.Types.ObjectId(val.$oid);
        }

        return null;
      })
      .filter(Boolean); // remove nulls
  }

  private getDistincts(model, field, baseQuery) {
    return model.distinct(field, {
      ...baseQuery,
      [field]: { $exists: true, $ne: [] },
    });
  }

  private async getCategories(findQuery): Promise<ModelResponse[]> {
    return this.fetchCollection(this.CategoryModel, findQuery);
  }

  private async getAccessibilities(findQuery): Promise<ModelResponse[]> {
    return this.fetchCollection(this.AccessibilityModel, findQuery);
  }

  private async getGroupTypes(findQuery): Promise<ModelResponse[]> {
    return this.fetchCollection(this.GroupTypeModel, findQuery);
  }

  private async getTags(findQuery: any): Promise<ModelResponse[]> {
    return this.fetchTags(this.TagsModel, findQuery);
  }

  private async fetchCollection(
    model: any,
    findQuery: any,
  ): Promise<ModelResponse[]> {
    return await model.find(findQuery).select('_id hebrewName').lean();
  }

  private async fetchTags(
    model: any,
    findQuery: any,
  ): Promise<ModelResponse[]> {
    return await model
      .find(findQuery)
      .select({ _id: 1, hebrewName: '$nameHe' })
      .lean();
  }
}
