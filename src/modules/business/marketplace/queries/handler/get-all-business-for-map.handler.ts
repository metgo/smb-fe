import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllProductsRawQuery } from 'src/modules/products/queries';
import { Product } from 'src/modules/products/schema/products.schema';
import { GetAllBusinessForMapQuery } from '../get-all-business-for-map.query';
import { Business } from '../../../shared/schema/business.schema';

@QueryHandler(GetAllBusinessForMapQuery)
export class GetAllBusinessForMapHandler
implements IQueryHandler<GetAllBusinessForMapQuery> {
  constructor(
    private queryBus: QueryBus,
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    @InjectModel(Product.name)
    private readonly ProductModel: Model<Product>,
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

      const businessIds = await this.ProductModel.distinct('businessId', {
        ...findQueryProduct,
      });

      const findQuery = {
        _id: { $in: businessIds },
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

      const allBusiness = await queryhandler<Business>(this.BusinessModel, {
        findQuery,
        select,
        populate,
        populate1,
        sort: 'name',
      });

      const businessResponse = await Promise.all(
        allBusiness.data.map(business => ({
          _id: business._id,
          name: business?.name,
          description: business?.description,
          status: business?.status,
          authorityId: business?.authorityId,
          dmoId: business?.dmoId,
          geoLocation: business?.geoLocation,
          location: business?.location,
          bussCategoriesId: business?.bussCategoriesId,
          bussSubCategoriesId: business?.bussSubCategoriesId,
          serviceType: business?.serviceType,
        })),
      );

      allBusiness.data = businessResponse;

      return allBusiness;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
