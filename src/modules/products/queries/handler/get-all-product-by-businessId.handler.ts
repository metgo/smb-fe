import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllProductsByBusinessIdQuery } from '../get-all-products-by-businessId.query';
import { ProductsAudit } from '../../schema/products-audit.schema';
import { ProductsService } from '../../products.services';

@QueryHandler(GetAllProductsByBusinessIdQuery)
export class GetAllProductsByBusinessIdHandler
implements IQueryHandler<GetAllProductsByBusinessIdQuery> {
  constructor(
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    private readonly productsService: ProductsService,
  ) {}

  async execute(queries: GetAllProductsByBusinessIdQuery): Promise<any> {
    try {
      const { businessId, locale } = queries;

      const select
        = '_id name nameHe nameAr description descriptionHe descriptionAr images price businessId productId';

      const findQuery = {
        businessId,
        isActive: true,
        isDeleted: { $ne: true },
      };
      const productsList = await queryhandler<ProductsAudit>(
        this.ProductsAuditModel,
        {
          findQuery,
          select,
          sort: 'createdAt',
          sortOrder: SortOrder.DESC,
          isLean: true,
        },
      );

      if (!productsList?.data || !productsList.data?.length) {
        return {
          totalData: 0,
          data: [],
        };
      }

      const mappedProducts = await Promise.all(
        productsList.data.map((product: any) => {
          const { _id, productId, ...rest } = product.toObject
            ? product.toObject()
            : product;

          return {
            ...rest,
            _id: productId,
          };
        }),
      );

      productsList.data = await Promise.all(
        mappedProducts.map(p => this.productsService.localizeProduct(p, locale)),
      );

      return productsList;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
