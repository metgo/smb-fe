import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllProductsRawQuery } from '../get-all-products-rawquery.query';
import { GetAllProductsQuery } from '../get-all-products.query';
import { ProductsAudit } from '../../schema/products-audit.schema';
import { ProductsService } from '../../products.services';

@QueryHandler(GetAllProductsQuery)
export class GetAllProductsHandler
implements IQueryHandler<GetAllProductsQuery> {
  constructor(
    private queryBus: QueryBus,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    private readonly productsService: ProductsService,
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
        locale,
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

      let select
        = '_id slug name nameHe nameAr description descriptionHe descriptionAr images price quantity businessId groupTypesId accessibilitiesId tagsId categories subCategories productId deliveryArea isPickUpAvailable deliveryAdditionalInfo deliverySpecificSellerInfo deliveryReturnExchange';

      let populate: any = [
        {
          path: 'businessId',
          select: '_id logo name nameHe nameAr isAlwaysOpen slug',
        },
        {
          path: 'categories subCategories',
          select: '_id name hebrewName',
        },
        {
          path: 'tagsId',
          select: '_id name nameHe nameAr',
        },
      ];

      if (queries?.customSelect) {
        select = queries.customSelect;
      }

      if (queries?.customPopulate) {
        populate = queries.customPopulate;
      }

      const productsList = await queryhandler<ProductsAudit>(
        this.ProductsAuditModel,
        {
          findQuery,
          select,
          page: Number(page),
          limit: Number(limit),
          sort: sortBy || 'createdAt',
          sortOrder: sortOrder || SortOrder.DESC,
          populate,
          isLean: true,
        },
      );

      if (!productsList?.data || !productsList.data?.length) {
        return {
          totalData: 0,
          products: [],
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
