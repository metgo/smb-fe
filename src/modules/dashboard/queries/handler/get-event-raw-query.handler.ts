import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetEventRawQuery } from '../get-event-raw-query.query';
import { EventStatus } from 'src/modules/events/events.type';

@QueryHandler(GetEventRawQuery)
export class GetEventRawQueryHandler
implements IQueryHandler<GetEventRawQuery> {
  constructor() {}

  async execute(queries: GetEventRawQuery) {
    try {
      const { search, campDetails } = queries.body;

      if (!campDetails?.dmoIds?.length && !campDetails?.authorityIds?.length) {
        return;
      }

      const today = new Date();
      let findQuery: any = {
        status: EventStatus.APPROVED,

        dayDescription: {
          $elemMatch: {
            date: { $gte: today },
          },
        },

        isDeleted: false,
      };

      const scopeOrConditions: any[] = [];

      if (campDetails?.dmoIds?.length) {
        scopeOrConditions.push({ dmoId: { $in: campDetails.dmoIds } });
      }

      if (campDetails?.authorityIds?.length) {
        scopeOrConditions.push({
          authorityId: { $in: campDetails.authorityIds },
        });
      }

      const filterOrConditions: any[] = [];

      const andConditions: any[] = [];

      if (scopeOrConditions.length) {
        andConditions.push({ $or: scopeOrConditions });
      }

      if (filterOrConditions.length) {
        andConditions.push({ $or: filterOrConditions });
      }

      if (andConditions.length) {
        findQuery = {
          ...findQuery,
          $and: andConditions,
        };
      }

      if (search) {
        findQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      return findQuery;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
