import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SortOrder, CommonStatus } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import { GetAllProductsForMapQuery } from '../get-all-products-for-map.query';
import { GetAllProductsRawQuery } from '../get-all-products-rawquery.query';
import { ProductsAudit } from '../../schema/products-audit.schema';
import { ProductsService } from '../../products.services';

@QueryHandler(GetAllProductsForMapQuery)
export class GetAllProductsForMapHandler
implements IQueryHandler<GetAllProductsForMapQuery> {
  constructor(
    private queryBus: QueryBus,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    private readonly productsService: ProductsService,
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

      const select
        = '_id name nameHe nameAr businessId categories subCategories productId';

      const populate = [
        {
          path: 'businessId',
          select: '_id name nameHe nameAr address geoLocation deliveryArea vendorDelivers vendorDeliveryArea globalDelivery globalDeliveryArea status isDeleted',
        },
        {
          path: 'categories subCategories',
          select: '_id name hebrewName',
        },
      ];

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

      const filteredByVendorStatus = mappedProducts.filter((product: any) => {
        const business = product?.businessId as any;
        return business && business.status === CommonStatus.APPROVED && !business.isDeleted;
      });

      productsList.data = await Promise.all(
        filteredByVendorStatus.map(p => this.productsService.localizeProduct(p, locale)),
      );

      return productsList;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
