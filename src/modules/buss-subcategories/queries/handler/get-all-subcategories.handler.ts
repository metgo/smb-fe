import { ICommandHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { CampaignService } from 'src/modules/campaign/campaign.service';
import { GetAllSubCategoriesQuery } from '../get-all-subcategories.query';
import { BussSubCategory } from '../../schema/buss-subCategory.schema';
import { Product } from 'src/modules/products/schema/products.schema';
import { GetAllProductsRawQuery } from 'src/modules/products/queries/get-all-products-rawquery.query';
import { Purpose } from '../../buss-subcategories.type';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import { GetAllBusinessesRawQuery } from 'src/modules/business/tourism/queries/get-all-businesses-rawquery.query';
import { GetAllEventsRawQuery } from 'src/modules/events/queries/get-all-events-rawquery.query';
import { GetAllTripsRawQuery } from 'src/modules/trips/queries/get-all-trips-rawquery.query';

@QueryHandler(GetAllSubCategoriesQuery)
export class GetAllSubCategoriesHandler
implements ICommandHandler<GetAllSubCategoriesQuery> {
  constructor(
    private queryBus: QueryBus,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('BussSubCategory')
    private readonly BussSubCategoryModel: Model<BussSubCategory>,
    @InjectModel(Product.name)
    private readonly ProductModel: Model<Product>,
    @InjectModel(Business.name)
    private readonly BusinessModel: Model<Business>,
    @InjectModel(Event.name)
    private readonly EventModel: Model<Event>,
    @InjectModel(Trip.name)
    private readonly TripModel: Model<Trip>,
    private readonly campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllSubCategoriesQuery): Promise<any> {
    try {
      const {
        page,
        limit,
        search,
        locale,
        campCode,
        bussCategoryId,
        groupTypesId,
        accessibilitiesId,
        vendorDelivers,
        priceMin,
        priceMax,
        purpose,
      } = queries.body;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (!campDetails?.category?.length) {
        return { data: [] };
      }

      if (
        !campDetails?.productIds?.length
        && !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return { data: [] };
      }

      const categoryIds = campDetails.category.map(cat => cat?.id?.toString());

      if (bussCategoryId && !categoryIds.includes(bussCategoryId.toString())) {
        return { data: [] };
      }

      let subCategoryIds;
      let findQueryForPurpose;

      if (purpose === Purpose.PRODUCT) {
        findQueryForPurpose = await this.queryBus.execute(
          new GetAllProductsRawQuery(
            campCode,
            null,
            bussCategoryId,
            null,
            groupTypesId,
            accessibilitiesId,
            priceMin,
            priceMax,
            search,
            vendorDelivers,
          ),
        );

        subCategoryIds = await this.ProductModel.distinct('subCategories', {
          ...findQueryForPurpose,
          subCategories: { $exists: true, $ne: [] },
        });
      }

      if (purpose === Purpose.BUSINESS) {
        findQueryForPurpose = await this.queryBus.execute(
          new GetAllBusinessesRawQuery(
            campCode,
            bussCategoryId,
            null,
            groupTypesId,
            accessibilitiesId,
            search,
          ),
        );

        subCategoryIds = await this.BusinessModel.distinct(
          'bussSubCategoriesId',
          {
            ...findQueryForPurpose,
            bussSubCategoriesId: { $exists: true, $ne: [] },
          },
        );
      }

      if (purpose === Purpose.EVENT) {
        if (!categoryIds.includes('6566e208a77d2a477266d2b3')) {
          return { data: [] };
        }

        findQueryForPurpose = await this.queryBus.execute(
          new GetAllEventsRawQuery(
            campCode,
            null,
            groupTypesId,
            accessibilitiesId,
            search,
          ),
        );
        subCategoryIds = await this.EventModel.distinct('subCategoriesId', {
          ...findQueryForPurpose,
          subCategoriesId: { $exists: true, $ne: [] },
        });
      }

      if (purpose === Purpose.TRIP) {
        findQueryForPurpose = await this.queryBus.execute(
          new GetAllTripsRawQuery(
            campCode,
            bussCategoryId,
            null,
            groupTypesId,
            accessibilitiesId,
            search,
          ),
        );

        const trips = await this.TripModel.find(findQueryForPurpose).select(
          'stations._id',
        );
        const businessIds = trips.flatMap(trip => trip.stations.map(station => station._id));

        const businesses = await this.BusinessModel.find({
          _id: { $in: businessIds },
        }).select('bussSubCategoriesId');

        const flatSubCategoryIds = businesses.flatMap(
          b => b.bussSubCategoriesId,
        );

        subCategoryIds = [...new Set(flatSubCategoryIds)];
      }

      if (!subCategoryIds || !subCategoryIds?.length) {
        return { data: [] };
      }

      const findQuery: any = {
        _id: { $in: subCategoryIds },
        ...(bussCategoryId && { bussCategoryId: { $in: bussCategoryId } }),
      };

      const queryPage = page ? Number(page) : null;
      const queryLimit = limit ? Number(limit) : null;

      const select = '_id name hebrewName';
      const populate = {
        path: 'bussCategoryId',
        select,
      };

      const bussSubCategory = await queryhandler<BussSubCategory>(
        this.BussSubCategoryModel,
        {
          findQuery,
          select,
          page: queryPage,
          limit: queryLimit,
          populate,
          sort: 'name',
          languageQuery: locale || Locale.HEBREW,
        },
      );

      bussSubCategory.data = await Promise.all(
        bussSubCategory?.data?.map(async subCat => {
          const parent = subCat?.bussCategoryId?.length
            ? await Promise.all(
              subCat.bussCategoryId.map(cat => (locale === Locale.ENGLISH ? cat.name : cat.hebrewName)),
            )
            : [];

          let productCount;
          if (purpose === Purpose.PRODUCT) {
            productCount = await this.ProductModel.countDocuments({
              ...findQueryForPurpose,
              subCategories: subCat._id,
            });
          }
          if (purpose === Purpose.BUSINESS) {
            productCount = await this.BusinessModel.countDocuments({
              ...findQueryForPurpose,
              bussSubCategoriesId: subCat._id,
            });
          }

          if (purpose === Purpose.EVENT) {
            productCount = await this.EventModel.countDocuments({
              ...findQueryForPurpose,
              subCategoriesId: subCat._id,
            });
          }

          return {
            id: subCat._id,
            name: subCat.name,
            parent,
            bussCategoryId: subCat.bussCategoryId[0]._id,
            productCount,
          };
        }),
      );
      return bussSubCategory;
    } catch (err) {
      this.logger.error('[SUBCATEGORIES]: FAILED TO LIST SUBCATEGORIES', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
