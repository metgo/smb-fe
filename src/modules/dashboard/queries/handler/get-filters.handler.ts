import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetFiltersQuery } from '../get-filters.query';
import { ServicesTypes } from '../../dashboard.type';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import {
  GetAllFilterResponse,
  GetRawQueryResponse,
  ModelResponse,
  SubCategoryResponse,
} from '../../response/get-all-filters.response';
import { GetBusinessRawQuery } from '../get-business-raw-query.query';
import { GetEventRawQuery } from '../get-event-raw-query.query';
import { GetTripRawQuery } from '../get-trip-raw-query.query';
import { GetPOIRawQuery } from '../get-poi-raw-query.query';

@QueryHandler(GetFiltersQuery)
export class GetFiltersHandler implements IQueryHandler<GetFiltersQuery> {
  constructor(
    private campaignService: CampaignService,

    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,

    @InjectModel(Event.name)
    private EventModel: Model<Event>,

    @InjectModel(Trip.name)
    private TripModel: Model<Trip>,

    @InjectModel(BussCategory.name)
    private CategoryModel: Model<BussCategory>,

    @InjectModel(BussSubCategory.name)
    private SubCategoryModel: Model<BussSubCategory>,

    @InjectModel(Accessibility.name)
    private AccessibilityModel: Model<Accessibility>,

    @InjectModel(GroupType.name)
    private GroupTypeModel: Model<GroupType>,

    private readonly queryBus: QueryBus,
  ) {}

  async execute(queries: GetFiltersQuery): Promise<GetAllFilterResponse> {
    try {
      const {
        campCode,
        categoriesId,
        subCategoriesId,
        groupTypesId,
        accessibilitiesId,
        serviceType,
      } = queries.body;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

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

      const [categories, subCategories, accessibilities, groupTypes]
        = await Promise.all([
          this.getCategories({
            _id: { $in: listOfCategoriesIds },
          }),
          this.getSubCategories({
            _id: { $in: listOfSubCategoriesIds },
          }),

          this.getAccessibilities({
            _id: { $in: listOfAccessibilityIds },
          }),

          this.getGroupTypes({
            _id: { $in: listOfGroupTypeIds },
          }),
        ]);

      return {
        accessibilities,
        categories,
        subCategories,
        groupTypes,
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

      const findQuery = await this.queryBus.execute(
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
        this.getDistincts(this.BusinessModel, 'accessibilitiesId', findQuery),
        this.getDistincts(this.BusinessModel, 'groupTypesId', findQuery),
        this.getDistincts(this.BusinessModel, 'bussCategoriesId', findQuery),
        this.getDistincts(this.BusinessModel, 'bussSubCategoriesId', findQuery),
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

      const findQuery = await this.queryBus.execute(
        new GetPOIRawQuery({
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
        this.getDistincts(this.BusinessModel, 'accessibilitiesId', findQuery),
        this.getDistincts(this.BusinessModel, 'groupTypesId', findQuery),
        this.getDistincts(this.BusinessModel, 'bussCategoriesId', findQuery),
        this.getDistincts(this.BusinessModel, 'bussSubCategoriesId', findQuery),
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
        this.getDistincts(this.EventModel, 'accessibilitiesId', findQuery),
        this.getDistincts(this.EventModel, 'groupTypesId', findQuery),
        this.getDistincts(this.EventModel, 'bussCategoriesId', findQuery),
        this.getDistincts(this.EventModel, 'bussSubCategoriesId', findQuery),
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
        this.getDistincts(this.TripModel, 'bussCategoriesId', matchQuery),
        this.getDistincts(this.TripModel, 'bussSubCategoriesId', matchQuery),
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

  private async fetchCollection(
    model: any,
    findQuery: any,
  ): Promise<ModelResponse[]> {
    return await model.find(findQuery).select('_id hebrewName').lean();
  }

  private async getSubCategories(findQuery): Promise<SubCategoryResponse[]> {
    return (
      await this.SubCategoryModel.find(findQuery)
        .select('_id hebrewName bussCategoryId')
        .lean()
    ).map(item => ({
      _id: item._id.toString(),
      hebrewName: item.hebrewName,
      categoryId: item.bussCategoryId[0].toString(),
    }));
  }
}
