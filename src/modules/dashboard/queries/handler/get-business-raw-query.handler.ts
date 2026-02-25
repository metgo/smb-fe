import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { BusinessStatus } from 'src/modules/business/business.type';
import { GetBusinessRawQuery } from '../get-business-raw-query.query';
import { ServicesTypes } from '../../dashboard.type';

@QueryHandler(GetBusinessRawQuery)
export class GetBusinessRawQueryHandler
implements IQueryHandler<GetBusinessRawQuery> {
  constructor() {}

  async execute(queries: GetBusinessRawQuery): Promise<any> {
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
        status: BusinessStatus.APPROVED,
        isDeleted: { $ne: true },
        serviceType: ServicesTypes.BUSINESS,
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

      return findQuery;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
