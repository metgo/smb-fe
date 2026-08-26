import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import { SortOrder, CommonStatus, Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { queryhandler } from 'src/core/helper/query-helper';
import {
  PRODUCTS_SEARCH_INDEX,
  buildHebrewSearchRegex,
  normalizeHebrewSearch,
} from 'src/core/helper/atlas-search.util';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { GetAllProductsRawQuery } from '../get-all-products-rawquery.query';
import { GetAllProductsQuery } from '../get-all-products.query';
import { ProductsAudit } from '../../schema/products-audit.schema';
import { ProductsService } from '../../products.services';
import { sanitizeImages } from 'src/core/helper/image.util';

@QueryHandler(GetAllProductsQuery)
export class GetAllProductsHandler
implements IQueryHandler<GetAllProductsQuery> {
  constructor(
    private queryBus: QueryBus,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    @InjectModel(Tags.name)
    private TagModel: Model<Tags>,
    @InjectModel(BussCategory.name)
    private CategoryModel: Model<BussCategory>,
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

      // If findQuery returned empty data signal, return early
      if (findQuery?.data && !findQuery.data.length) {
        return { totalData: 0, products: [] };
      }

      let select
        = '_id productId slug name nameHe nameAr description descriptionHe descriptionAr images price quantity businessId';

      let populate: any = [
        {
          path: 'businessId',
          select: '_id logo name nameHe nameAr slug',
        },
      ];

      if (queries?.customSelect) {
        select = queries.customSelect;
      }

      if (queries?.customPopulate) {
        populate = queries.customPopulate;
      }

      // Use Atlas Search when search term is provided — with regex fallback
      if (search) {
        try {
          const normalizedSearch = normalizeHebrewSearch(search);
          const searchTerms = [search, normalizedSearch].filter(
            (t, i, arr) => t && arr.indexOf(t) === i,
          );

          const pageNum = Number(page) || 1;
          const limitNum = Number(limit) || 20;
          const skip = (pageNum - 1) * limitNum;

          // Search paths for Atlas
          const searchPaths = [
            'name',
            'nameHe',
            'nameAr',
            'description',
            'descriptionHe',
            'descriptionAr',
          ];

          // Contextual Search: Find categories matching search terms
          let matchingCategoryIds: any[] = [];
          try {
            const categoryOrQueries = searchTerms
              .map(t => {
                const r = buildHebrewSearchRegex(t);
                return [
                  { name: { $regex: r.source, $options: 'i' } },
                  { hebrewName: { $regex: r.source, $options: 'i' } },
                ];
              })
              .flat();
            matchingCategoryIds = await this.CategoryModel.find({
              $or: categoryOrQueries,
            }).select('_id');
          } catch (catError: any) {
            console.warn(
              '[Contextual Search] Failed to fetch matching categories in Products:',
              catError?.message,
            );
          }

          // Contextual Search: Find tags matching search terms
          let matchingTagIds: any[] = [];
          try {
            const tagOrQueries = searchTerms
              .map(t => {
                const r = buildHebrewSearchRegex(t);
                return [
                  { name: { $regex: r.source, $options: 'i' } },
                  { nameHe: { $regex: r.source, $options: 'i' } },
                  { nameAr: { $regex: r.source, $options: 'i' } },
                ];
              })
              .flat();
            matchingTagIds = await this.TagModel.find({
              $or: tagOrQueries,
            }).select('_id');
          } catch (tagError: any) {
            console.warn(
              '[Contextual Search] Failed to fetch matching tags in Products:',
              tagError?.message,
            );
          }

          // Build search clauses for each term
          const shouldClauses: any[] = searchTerms.map((term, index) => {
            const isOriginalInput = index === 0;
            const isNormalizedOriginal = index === 1;
            const isHighPriority = isOriginalInput || isNormalizedOriginal;

            if (term.includes(' ')) {
              // Multi-word: use phrase match to avoid splitting on spaces
              // (prevents false positives like "עץ" matching everything)
              return {
                phrase: {
                  query: term,
                  path: searchPaths,
                  slop: 1,
                  ...(isHighPriority && { score: { boost: { value: 10 } } }),
                },
              };
            }

            // Single word: use text with fuzzy (Atlas tokenizer handles nikud internally for fuzzy matches)
            return {
              text: {
                query: term,
                path: searchPaths,
                fuzzy: { maxEdits: 2, prefixLength: 1 },
                ...(isHighPriority && { score: { boost: { value: 10 } } }),
              },
            };
          });

          // Add category matches to Atlas should clauses
          matchingCategoryIds.forEach(cat => {
            shouldClauses.push({
              text: {
                query: cat._id.toString(),
                path: ['categories'],
              },
            });
          });

          // Add tag matches to Atlas should clauses
          matchingTagIds.forEach(tag => {
            shouldClauses.push({
              text: {
                query: tag._id.toString(),
                path: ['tagsId'],
              },
            });
          });

          console.log(
            '[Search] original:',
            search,
            '| terms used:',
            searchTerms.length,
          );

          const searchStage = {
            $search: {
              index: PRODUCTS_SEARCH_INDEX,
              compound: {
                should: shouldClauses,
                minimumShouldMatch: 1,
              },
            },
          };

          // Remove regex search conditions from findQuery — Atlas Search handles it
          const { $and: andConditions, ...baseQuery } = findQuery;
          const nonSearchConditions = (andConditions || []).filter(
            (cond: any) => !cond.$or?.some((o: any) => o.nameHe !== undefined),
          );

          const matchStage: PipelineStage = {
            $match: {
              ...baseQuery,
              ...(nonSearchConditions.length && { $and: nonSearchConditions }),
            },
          };

          const pipeline: PipelineStage[] = [
            searchStage as any,
            matchStage,
            {
              $sort: {
                [sortBy || 'createdAt']: sortOrder === SortOrder.ASC ? 1 : -1,
              },
            },
            { $skip: skip },
            { $limit: limitNum },
          ];

          const countPipeline: PipelineStage[] = [
            searchStage as any,
            matchStage,
            { $count: 'total' },
          ];

          const [results, countResult] = await Promise.all([
            this.ProductsAuditModel.aggregate(pipeline),
            this.ProductsAuditModel.aggregate(countPipeline),
          ]);

          const totalData = countResult[0]?.total || 0;

          if (!results.length) {
            return { totalData: 0, products: [] };
          }

          const mappedProducts = await Promise.all(
            results.map((product: any) => {
              const { _id, productId, ...rest } = product;
              return {
                ...rest,
                _id: productId,
                businessId: {
                  ...rest.businessId,
                  logo: sanitizeImages([rest?.businessId?.logo])[0],
                },
                images: sanitizeImages(rest.images?.slice(0, 1)),
              };
            }),
          );

          const filteredByVendorStatus = mappedProducts.filter(
            (product: any) => {
              const business = product?.businessId as any;
              return (
                business
                && business.status === CommonStatus.APPROVED
                && !business.isDeleted
              );
            },
          );

          const localizedProducts = await Promise.all(
            filteredByVendorStatus.map(p => this.productsService.localizeProduct(p, locale)),
          );

          return {
            totalData,
            data: localizedProducts,
            meta: {
              page: pageNum,
              limit: limitNum,
              data: localizedProducts.length,
              pageCount: Math.ceil(totalData / limitNum),
              hasPreviousPage: pageNum > 1,
              hasNextPage: pageNum < Math.ceil(totalData / limitNum),
            },
          };
        } catch (atlasError: any) {
          // Atlas Search failed — fall back to regex search silently
          console.warn(
            '[Atlas Search] Falling back to regex search:',
            atlasError?.message,
          );
        }
      }

      // Default path: no search, or Atlas Search fallback
      // Drop the isActive filter here and instead pick, per productId, whichever
      // audit document is most recently created — this way a productId with no
      // isActive:true doc still shows (via its latest doc), and an isActive:true
      // doc that isn't the latest one no longer wins just because it's active.
      const { isActive: _isActive, ...dedupeMatchQuery } = findQuery;

      // Use find() (not aggregate()) here so Mongoose applies its normal
      // schema-based casting to query-string ids like businessId/categoriesId.
      const candidateDocs = await this.ProductsAuditModel.find(dedupeMatchQuery)
        .select('_id productId createdAt')
        .lean();

      if (!candidateDocs.length) {
        return { totalData: 0, products: [] };
      }

      const latestByProductId = (candidateDocs as any[]).reduce<
        Map<string, { _id: any; createdAt: Date }>
      >((acc, doc) => {
        const key = doc.productId.toString();
        const existing = acc.get(key);
        if (!existing || doc.createdAt > existing.createdAt) {
          acc.set(key, doc);
        }
        return acc;
      }, new Map());

      const latestIds = Array.from(latestByProductId.values()).map(d => d._id);

      const productsList = await queryhandler<ProductsAudit>(
        this.ProductsAuditModel,
        {
          findQuery: { _id: { $in: latestIds } },
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
            businessId: {
              ...rest.businessId,
              logo: sanitizeImages([rest?.businessId?.logo])[0],
            },
            images: sanitizeImages(rest.images?.slice(0, 1)),
          };
        }),
      );

      productsList.data = await Promise.all(
        mappedProducts.map(p => this.productsService.localizeProduct(p, Locale.HEBREW)),
      );
      return productsList;
    } catch (err) {
      exceptionHandling(err);
    }
  }
}
