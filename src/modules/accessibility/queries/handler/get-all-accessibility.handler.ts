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
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { Trip } from 'src/modules/trips/schema/trips.schema';
import { GetAllBusinessesRawQuery } from 'src/modules/business/tourism/queries/get-all-businesses-rawquery.query';
import { GetAllTripsRawQuery } from 'src/modules/trips/queries/get-all-trips-rawquery.query';
import { GetAllAccessibilityQuery } from '../get-all-accessibility.query';
import { Purpose } from '../../accessibility.type';
import { Accessibility } from '../../schema/accessibility.schema';

@QueryHandler(GetAllAccessibilityQuery)
export class GetAllAccessibilityHandler
implements ICommandHandler<GetAllAccessibilityQuery> {
  constructor(
    private queryBus: QueryBus,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Business.name)
    private readonly BusinessModel: Model<Business>,
    @InjectModel(Trip.name)
    private readonly TripModel: Model<Trip>,
    @InjectModel(Accessibility.name)
    private readonly AccessibilityModel: Model<Accessibility>,
    private readonly campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllAccessibilityQuery): Promise<any> {
    try {
      const {
        page,
        limit,
        search,
        locale,
        campCode,
        bussCategoryId,
        bussSubCategoryId,
        purpose,
      } = queries.body;

      const campDetails = await this.campaignService.findCampaignAndReturn(
        'code',
        campCode,
      );

      if (
        !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return { data: [] };
      }

      let accessibilityIds = [];
      let findQueryForPurpose;

      if (purpose === Purpose.BUSINESS) {
        findQueryForPurpose = await this.queryBus.execute(
          new GetAllBusinessesRawQuery(
            campCode,
            bussCategoryId,
            bussSubCategoryId,
            null,
            null,
            search,
          ),
        );

        accessibilityIds = await this.BusinessModel.distinct(
          'accessibilitiesId',
          {
            ...findQueryForPurpose,
            accessibilitiesId: { $exists: true, $ne: [] },
          },
        );
      }

      if (purpose === Purpose.TRIP) {
        findQueryForPurpose = await this.queryBus.execute(
          new GetAllTripsRawQuery(
            campCode,
            bussCategoryId,
            bussSubCategoryId,
            null,
            null,
            search,
          ),
        );

        const trips = await this.TripModel.find(findQueryForPurpose).select(
          'stations._id',
        );

        const businessIds = trips.flatMap(trip => trip.stations.map(station => station._id));

        const businesses = await this.BusinessModel.find({
          _id: { $in: businessIds },
        }).select('accessibilitiesId');

        const flatAccessibilitiesIds = businesses.flatMap(
          b => b.accessibilitiesId,
        );

        accessibilityIds = [...new Set(flatAccessibilitiesIds)];
      }

      if (!accessibilityIds || !accessibilityIds?.length) {
        return { data: [] };
      }

      const findQuery: any = {
        _id: { $in: accessibilityIds },
      };

      const queryPage = page ? Number(page) : null;
      const queryLimit = limit ? Number(limit) : null;

      const select = '_id name hebrewName';

      const accessibilities = await queryhandler<Accessibility>(
        this.AccessibilityModel,
        {
          findQuery,
          select,
          page: queryPage,
          limit: queryLimit,
          sort: 'name',
          languageQuery: locale || Locale.HEBREW,
        },
      );
      return accessibilities;
    } catch (err) {
      this.logger.error('[ACCESSIBILITY]: FAILED TO LIST ACCESSIBILITY', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
