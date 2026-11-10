import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetPOIRawQuery } from '../get-poi-raw-query.query';
import { CommonStatus } from 'src/common/enum';

@QueryHandler(GetPOIRawQuery)
export class GetPOIRawQueryHandler implements IQueryHandler<GetPOIRawQuery> {
  constructor() {}

  async execute(queries: GetPOIRawQuery): Promise<any> {
    try {
      const {
        categoriesId,
        subCategoriesId,
        accessibilitiesId,
        groupTypesId,
        search,
        campDetails,
      } = queries.body;

      if (
        !campDetails?.dmoIds?.length
        && !campDetails?.authorityIds?.length
        && !campDetails?.businessIds?.length
      ) {
        return;
      }

      let findQuery: any = {
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
        isActive: true,
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

      const filtersOrConditions: any[] = [];

      if (categoriesId?.length) {
        const ids = Array.isArray(categoriesId) ? categoriesId : [categoriesId];
        filtersOrConditions.push({ bussCategoriesId: { $in: ids } });
      }

      if (subCategoriesId?.length) {
        const ids = Array.isArray(subCategoriesId)
          ? subCategoriesId
          : [subCategoriesId];
        filtersOrConditions.push({ bussSubCategoriesId: { $in: ids } });
      }

      const andConditions: any[] = [];

      if (groupTypesId?.length) {
        const ids = Array.isArray(groupTypesId) ? groupTypesId : [groupTypesId];
        andConditions.push({ groupTypesId: { $all: ids } });
      }

      if (accessibilitiesId?.length) {
        const ids = Array.isArray(accessibilitiesId)
          ? accessibilitiesId
          : [accessibilitiesId];
        andConditions.push({ accessibilitiesId: { $all: ids } });
      }

      if (scopeOrConditions.length) {
        andConditions.push({ $or: scopeOrConditions });
      }

      if (filtersOrConditions.length) {
        andConditions.push({ $or: filtersOrConditions });
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

      const whitelist = campDetails?.whitelist?.business ?? [];
      const blacklist = campDetails?.blacklist?.business ?? [];

      return { findQuery, whitelist, blacklist };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
