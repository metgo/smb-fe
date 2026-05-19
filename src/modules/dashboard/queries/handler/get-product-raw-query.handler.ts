import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetProductRawQuery } from '../get-product-raw-query.query';

@QueryHandler(GetProductRawQuery)
export class GetProductRawQueryHandler
implements IQueryHandler<GetProductRawQuery> {
  constructor() {}

  async execute(queries: GetProductRawQuery): Promise<any> {
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
        && !campDetails?.productIds?.length
      ) {
        return;
      }

      const findQuery: any = {
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
        scopeOrConditions.push({
          businessId: { $in: campDetails.businessIds },
        });
      }

      if (campDetails?.productIds?.length) {
        scopeOrConditions.push({ productId: { $in: campDetails.productIds } });
      }

      if (scopeOrConditions.length) {
        findQuery.$and = [...findQuery.$and, { $or: scopeOrConditions }];
      }

      if (categoriesId?.length) {
        const ids = Array.isArray(categoriesId) ? categoriesId : [categoriesId];
        findQuery.$and = [...findQuery.$and, { categories: { $in: ids } }];
      }

      if (subCategoriesId?.length) {
        const ids = Array.isArray(subCategoriesId)
          ? subCategoriesId
          : [subCategoriesId];
        findQuery.$and = [...findQuery.$and, { subCategories: { $in: ids } }];
      }

      if (groupTypesId?.length) {
        const ids = Array.isArray(groupTypesId) ? groupTypesId : [groupTypesId];
        findQuery.$and = [...findQuery.$and, { groupTypesId: { $all: ids } }];
      }

      if (accessibilitiesId?.length) {
        const ids = Array.isArray(accessibilitiesId)
          ? accessibilitiesId
          : [accessibilitiesId];
        findQuery.$and = [
          ...findQuery.$and,
          { accessibilitiesId: { $all: ids } },
        ];
      }

      if (search) {
        findQuery.$and = [
          ...findQuery.$and,
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          },
        ];
      }

      const whitelist = campDetails?.whitelist?.product ?? [];
      const blacklist = campDetails?.blacklist?.product ?? [];

      return { findQuery, whitelist, blacklist };
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
