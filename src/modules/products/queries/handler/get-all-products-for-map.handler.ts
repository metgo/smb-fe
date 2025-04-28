import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllProductsForMapQuery } from '../get-all-products-for-map.query';
import { Product } from '../../schema/products.schema';
import { GetAllProductsRawQuery } from '../get-all-products-rawquery.query';

@QueryHandler(GetAllProductsForMapQuery)
export class GetAllProductsForMapHandler
implements IQueryHandler<GetAllProductsForMapQuery> {
  constructor(
    private queryBus: QueryBus,
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
  ) {}

  async execute(queries: GetAllProductsForMapQuery): Promise<any> {
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

      const select = '_id name businessId categories subCategories';

      const populate = [
        {
          path: 'businessId',
          select: '_id name address geoLocation',
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
