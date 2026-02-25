import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetTripRawQuery } from '../get-trip-raw-query.query';
import { ServicesTypes } from '../../dashboard.type';
import { TripStatus } from 'src/modules/trips/trips.types';

@QueryHandler(GetTripRawQuery)
export class GetTripRawQueryHandler implements IQueryHandler<GetTripRawQuery> {
  constructor() {}

  async execute(queries: GetTripRawQuery) {
    try {
      const { serviceType, campDetails } = queries.body;

      if (!campDetails?.dmoIds?.length && !campDetails?.authorityIds?.length) {
        return;
      }

      const orConditionsDMO = [];

      if (campDetails.dmoIds?.length) {
        orConditionsDMO.push({ dmoId: { $in: campDetails.dmoIds } });
      }

      if (campDetails.authorityIds?.length) {
        orConditionsDMO.push({
          authorityId: { $in: campDetails.authorityIds },
        });
      }

      const matchQuery: Record<string, any> = {
        status: TripStatus.APPROVED,
        isDeleted: { $ne: true },
        ...(orConditionsDMO.length > 0 && { $or: orConditionsDMO }),
      };

      if (serviceType && serviceType?.length) {
        if (
          serviceType.includes(ServicesTypes.TRIPS)
          && !serviceType.includes(ServicesTypes.FUNDAY)
        ) {
          matchQuery.isTrip = true;
        } else if (
          serviceType.includes(ServicesTypes.FUNDAY)
          && !serviceType.includes(ServicesTypes.TRIPS)
        ) {
          matchQuery.isTrip = false;
        }
      }

      return matchQuery;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
