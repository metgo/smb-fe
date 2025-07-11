import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { Product } from '../../schema/products.schema';
import { GetAllProductsByBusinessIdQuery } from '../get-all-products-by-businessId.query';

@QueryHandler(GetAllProductsByBusinessIdQuery)
export class GetAllProductsByBusinessIdHandler
implements IQueryHandler<GetAllProductsByBusinessIdQuery> {
  constructor(
    @InjectModel(Product.name)
    private ProductModel: Model<Product>,
  ) {}

  async execute(queries: GetAllProductsByBusinessIdQuery): Promise<any> {
    try {
      const { businessId } = queries;

      const select = '_id name description images price businessId';

      const findQuery = {
        businessId,
      };
      const productsList = await queryhandler<Product>(this.ProductModel, {
        findQuery,
        select,
        sort: 'createdAt',
        sortOrder: SortOrder.DESC,
      });

      if (!productsList?.data || !productsList.data?.length) {
        return {
          totalData: 0,
          data: [],
        };
      }

      return productsList;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
