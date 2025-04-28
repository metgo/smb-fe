import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { Product } from '../../schema/products.schema';
import { GetAllProductsRawQuery } from '../get-all-products-rawquery.query';
import { GetAllProductsQuery } from '../get-all-products.query';

@QueryHandler(GetAllProductsQuery)
export class GetAllProductsHandler
implements IQueryHandler<GetAllProductsQuery> {
  constructor(
    private queryBus: QueryBus,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
  ) {}

  async execute(queries: GetAllProductsQuery): Promise<any> {
    try {
      const {
        campCode,
        businessId,
        categoriesId,
        subCategoriesId,
        groupTypesId,
        accessibilitiesId,
        priceMin,
        priceMax,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
        vendorDelivers,
      } = queries.query;

      const findQuery = await this.queryBus.execute(
        new GetAllProductsRawQuery(
          campCode,
          businessId,
          categoriesId,
          subCategoriesId,
          groupTypesId,
          accessibilitiesId,
          priceMin,
          priceMax,
          search,
          vendorDelivers,
        ),
      );

      const select
        = '_id name description images price quantity businessId categories subCategories';

      const populate = [
        {
          path: 'businessId',
          select:
            '_id logo name address geoLocation location openingHrs isAlwaysOpen',
        },
        {
          path: 'categories subCategories',
          select: '_id name hebrewName',
        },
      ];

      const productsList = await queryhandler<Product>(this.ProductModel, {
        findQuery,
        select,
        page: Number(page),
        limit: Number(limit),
        sort: sortBy || 'createdAt',
        sortOrder: sortOrder || SortOrder.DESC,
        populate,
      });

      if (!productsList?.data || !productsList.data?.length) {
        return {
          totalData: 0,
          products: [],
        };
      }

      return productsList;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
