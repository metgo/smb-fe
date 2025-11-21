import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'typeorm';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetDefaultFiltersQuery } from '../get-default-filters.query';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { BussSubCategory } from 'src/modules/buss-subcategories/schema/buss-subCategory.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { ServicesTypes } from '../../dashboard.type';
import { GetDefaultFilterResponse } from '../../response/get-default-filters.response';

@QueryHandler(GetDefaultFiltersQuery)
export class GetDefaultFiltersHandler
implements IQueryHandler<GetDefaultFiltersQuery> {
  constructor(
    @InjectModel(BussCategory.name)
    private CategoryModel: Model<BussCategory>,
    @InjectModel(BussSubCategory.name)
    private SubCategoryModel: Model<BussSubCategory>,
    @InjectModel(GroupType.name)
    private GroupTypeModel: Model<GroupType>,
    @InjectModel(Accessibility.name)
    private AccessibilityModel: Model<Accessibility>,
    private readonly externalApiService: ExternalApiServices,
  ) {}

  async execute(
    query: GetDefaultFiltersQuery,
  ): Promise<GetDefaultFilterResponse> {
    try {
      const { identifierId } = query;

      const externalApi = await this.externalApiService.findByFieldName(
        'identifierId',
        identifierId,
      );

      if (!externalApi) {
        throw new NotFoundException('Wrong IdentifierId');
      }

      const {
        categoryIds,
        subCategoryIds,
        groupTypesId,
        accesibilitiesId,
        displayBusinesses,
        displayEvents,
        displayTrips,
        displayPOI,
        displayFunday,
      } = externalApi;

      const [categories, subCategories, groupTypes, accessibilities]
        = await Promise.all([
          this.fetchIds(this.CategoryModel, categoryIds),
          this.fetchIds(this.SubCategoryModel, subCategoryIds),
          this.fetchIds(this.GroupTypeModel, groupTypesId),
          this.fetchIds(this.AccessibilityModel, accesibilitiesId),
        ]);

      const serviceTypes = [];
      if (displayBusinesses) serviceTypes.push(ServicesTypes.BUSINESS);
      if (displayPOI) serviceTypes.push(ServicesTypes.POINT_OF_INTEREST);
      if (displayEvents) serviceTypes.push(ServicesTypes.EVENT);
      if (displayFunday) serviceTypes.push(ServicesTypes.FUNDAY);
      if (displayTrips) serviceTypes.push(ServicesTypes.TRIPS);

      return {
        categoryIds: categories,
        subCategoryIds: subCategories,
        groupTypeIds: groupTypes,
        accessibilityIds: accessibilities,
        serviceTypes,
      };
    } catch (err) {
      exceptionHandling(err);
    }
  }

  private async fetchIds(model, ids: ObjectId[]): Promise<string[]> {
    if (!ids?.length) return [];

    const records = await model
      .find({ _id: { $in: ids } })
      .select('_id')
      .lean();

    return records.map(item => item._id.toString());
  }
}
