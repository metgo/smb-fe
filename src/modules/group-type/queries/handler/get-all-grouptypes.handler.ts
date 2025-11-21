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
import { GetAllGroupTypesQuery } from '../get-all-grouptypes.query';
import { GroupType } from '../../schema/group-type.schema';
import { Purpose } from '../../group-type.type';

@QueryHandler(GetAllGroupTypesQuery)
export class GetAllGroupTypesHandler
implements ICommandHandler<GetAllGroupTypesQuery> {
  constructor(
    private queryBus: QueryBus,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Business.name)
    private readonly BusinessModel: Model<Business>,
    @InjectModel(Trip.name)
    private readonly TripModel: Model<Trip>,
    @InjectModel(GroupType.name)
    private readonly GroupTypeModel: Model<GroupType>,
    private readonly campaignService: CampaignService,
  ) {}

  async execute(queries: GetAllGroupTypesQuery): Promise<any> {
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

      let groupTypesId;
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

        groupTypesId = await this.BusinessModel.distinct('groupTypesId', {
          ...findQueryForPurpose,
          groupTypesId: { $exists: true, $ne: [] },
        });
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
        }).select('groupTypesId');

        const flatGroupTypesIds = businesses.flatMap(b => b.groupTypesId);

        groupTypesId = [...new Set(flatGroupTypesIds)];
      }

      if (!groupTypesId || !groupTypesId?.length) {
        return { data: [] };
      }

      const findQuery: any = {
        _id: { $in: groupTypesId },
      };

      const queryPage = page ? Number(page) : null;
      const queryLimit = limit ? Number(limit) : null;

      const select = '_id name hebrewName';

      const groupTypes = await queryhandler<GroupType>(this.GroupTypeModel, {
        findQuery,
        select,
        page: queryPage,
        limit: queryLimit,
        sort: 'name',
        languageQuery: locale || Locale.HEBREW,
      });
      return groupTypes;
    } catch (err) {
      this.logger.error('[GROUPTYPES]: FAILED TO LIST GROUPTYPES', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
