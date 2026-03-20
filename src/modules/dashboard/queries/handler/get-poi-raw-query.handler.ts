import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { BusinessStatus } from 'src/modules/business/business.type';
import { GetPOIRawQuery } from '../get-poi-raw-query.query';
import { ServicesTypes } from '../../dashboard.type';

@QueryHandler(GetPOIRawQuery)
export class GetPOIRawQueryHandler implements IQueryHandler<GetPOIRawQuery> {
  constructor() {}

  async execute(queries: GetPOIRawQuery): Promise<any> {
    try {
      const { search, campDetails } = queries.body;

      if (
        !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return;
      }

      const findQuery: any = {
        status: BusinessStatus.APPROVED,
        isDeleted: { $ne: true },
        serviceType: ServicesTypes.POINT_OF_INTEREST,
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

      if (campDetails?.businessIds?.length) {
        scopeOrConditions.push({ _id: { $in: campDetails.businessIds } });
      }

      if (scopeOrConditions.length) {
        findQuery.$and = [{ $or: scopeOrConditions }];
      }

      if (search) {
        findQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const whitelist = campDetails?.whitelist?.poi ?? [];
      const blacklist = campDetails?.blacklist?.poi ?? [];

      return { findQuery, whitelist, blacklist };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
