import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllProductsRawQuery } from 'src/modules/products/queries';
import { GetAllBusinessForMapQuery } from '../get-all-business-for-map.query';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { BusinessService } from 'src/modules/business/shared/services/business.service';

@QueryHandler(GetAllBusinessForMapQuery)
export class GetAllBusinessForMapHandler
implements IQueryHandler<GetAllBusinessForMapQuery> {
  constructor(
    private queryBus: QueryBus,
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    private readonly businessService: BusinessService,
  ) {}

  async execute(queries: GetAllBusinessForMapQuery): Promise<any> {
    try {
      const {
        search,
        groupTypesId,
        accessibilitiesId,
        bussCategoriesId,
        bussSubCategoriesId,
        campCode,
        locale,
      } = queries.query;

      const findQueryProduct = await this.queryBus.execute(
        new GetAllProductsRawQuery(
          campCode,
          null,
          bussCategoriesId,
          bussSubCategoriesId,
          groupTypesId,
          accessibilitiesId,
          null,
          null,
          search,
          null,
        ),
      );

      const businessIds = await this.ProductsAuditModel.distinct('businessId', {
        ...findQueryProduct,
      });

      const findQuery = {
        businessId: { $in: businessIds },
        isActive: true,
        isDeleted: { $ne: true },
      };

      const populate = {
        path: 'bussCategoriesId bussSubCategoriesId',
        select: `${disSelect}`,
        populate: {
          path: 'icon',
          select: `${disSelect}`,
        },
      };

      const populate1 = {
        path: 'dmoId authorityId',
        select: `${disSelect} -userId -collaboratorsUser`,
      };

      const select = `${disSelect}`;

      const allBusiness = await queryhandler<BusinessesAudit>(
        this.BusinessesAuditModel,
        {
          findQuery,
          select,
          populate,
          populate1,
          sort: 'name',
          isLean: true,
        },
      );

      const businessResponse = await Promise.all(
        allBusiness.data.map(business => ({
          _id: business.businessId,
          name: business?.name,
          description: business?.description,
          status: business?.status,
          authorityId: business?.authorityId,
          dmoId: business?.dmoId,
          geoLocation: business?.geoLocation,
          location: business?.location,
          bussCategoriesId: business?.bussCategoriesId,
          bussSubCategoriesId: business?.bussSubCategoriesId,
          slug: business?.slug,
        })),
      );

      allBusiness.data = await Promise.all(
        businessResponse.map(p => this.businessService.localizeBusiness(p, locale)),
      );

      return allBusiness;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
