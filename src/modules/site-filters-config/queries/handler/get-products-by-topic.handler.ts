import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { CommonStatus, Locale } from 'src/common/enum';
import { paginateData } from 'src/common/pagination';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  getLocalizedValue,
  localizeFields,
} from 'src/core/helper/localization.util';
import { ConfigService } from 'src/services/config/config.service';
import { expandSearchTerms } from 'src/core/helper/search-expansion.util';
import {
  PRODUCTS_SEARCH_INDEX,
  buildHebrewSearchRegex,
  normalizeHebrewSearch,
  normalizeArabicSearch,
} from 'src/core/helper/atlas-search.util';
import { GetProductsByTopicQuery } from '../get-products-by-topic.query';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { Business } from 'src/modules/business/shared/schema/business.schema';

@QueryHandler(GetProductsByTopicQuery)
export class GetProductsByTopicHandler
implements IQueryHandler<GetProductsByTopicQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteFiltersConfig.name)
    private SiteFiltersConfigModel: Model<SiteFiltersConfig>,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    @InjectModel(BussCategory.name)
    private BussCategoryModel: Model<BussCategory>,
    @InjectModel(Tags.name)
    private TagsModel: Model<Tags>,
    @InjectModel(Campaign.name)
    private CampaignModel: Model<Campaign>,
    @InjectModel(ExternalApi.name)
    private ExternalApiModel: Model<ExternalApi>,
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    private readonly configService: ConfigService,
  ) {}

  async execute({
    externalApiId,
    query,
  }: GetProductsByTopicQuery): Promise<any> {
    const {
      groupTypesId,
      accessibilitiesId,
      tagsId,
      page,
      limit,
      locale,
      hasDelivery,
      search,
    } = query;

    try {
      let searchOrConditions: any[] = [];
      let expandedTerms: string[] = [];
      let searchTerms: string[] = [];
      let matchingBusinessIds: any[] = [];
      let matchingBusinessNameIds: any[] = [];
      let matchingBusinessShortDescIds: any[] = [];
      let matchingCategoryIds: any[] = [];
      let matchingTagIds: any[] = [];
      let normalizedBase = '';
      let buildSearchConditions:
        | ((terms: string[], fields: string[]) => any[])
        | null = null;
      let lookupTerms: string[] = [];
      let atlasRankedIds: string[] = [];

      const siteSettingsPromise = this.SiteFiltersConfigModel.findOne({
        externalApiId,
        status: SiteFiltersConfigStatus.APPROVED,
      })
        .select('siteTopics')
        .lean();

      if (search) {
        normalizedBase = normalizeArabicSearch(normalizeHebrewSearch(search));
        const apiKey = this.configService.get('GEMINI_API_KEY');
        expandedTerms = await expandSearchTerms(normalizedBase, apiKey);
        searchTerms = [
          ...new Set(
            [search, normalizedBase, ...expandedTerms].filter(Boolean),
          ),
        ];

        const regexMap = new Map(
          searchTerms.map(t => [t, buildHebrewSearchRegex(t)]),
        );
        lookupTerms = searchTerms.slice(0, 5);

        buildSearchConditions = (terms: string[], fields: string[]) => terms.flatMap(t => {
          const r = regexMap.get(t) ?? buildHebrewSearchRegex(t);
          return fields.map(f => ({
            [f]: { $regex: r.source, $options: 'i' },
          }));
        });

        const fallbackTerms = searchTerms.slice(0, 6);
        searchOrConditions = fallbackTerms.flatMap(term => {
          const regex = regexMap.get(term) ?? buildHebrewSearchRegex(term);
          return [
            { name: regex },
            { nameHe: regex },
            { nameAr: regex },
            { shortDescription: regex },
            { shortDescriptionHe: regex },
            { shortDescriptionAr: regex },
            { slug: regex },
          ];
        });
      }

      const siteSettings = await siteSettingsPromise;

      let siteCategories: any[] = [];

      if (siteSettings && siteSettings?.siteTopics?.length) {
        if (query.topic?.length) {
          const matchedTopics = (siteSettings?.siteTopics || []).filter(t => query.topic.some(
            tp => t.title === tp || t.titleHe === tp || t.titleAr === tp,
          ));
          this.logger.debug(
            `Found ${matchedTopics.length} topic(s) for "${query.topic.join(
              ', ',
            )}"`,
          );

          siteCategories = matchedTopics.flatMap(t => t.siteCategories || []);
        } else {
          siteCategories = (siteSettings.siteTopics || []).flatMap(
            t => t.siteCategories || [],
          );
        }
      } else {
        const fallbackResult = await this.fallbackByPrimaryCategory(
          {
            groupTypesId,
            accessibilitiesId,
            tagsId,
            page,
            limit,
            locale: locale as Locale,
            search,
          },
          query.topic,
          query.category,
          externalApiId,
          hasDelivery,
          searchOrConditions,
        );
        return fallbackResult;
      }

      const productCategoryEntries = siteCategories
        .filter(category => {
          if (category.isArchived) return false;
          if (!query.category?.length) return true;
          return query.category.some(
            cat => category.title === cat
              || category.titleHe === cat
              || category.titleAr === cat,
          );
        })
        .flatMap(category => (category.productIds || []).map(productId => ({
          productId: productId.toString(),
          category: {
            title: category.title,
            titleHe: category.titleHe,
            titleAr: category.titleAr,
          },
        })));

      if (!productCategoryEntries.length) {
        return [];
      }

      const allProductIds = productCategoryEntries.map(e => e.productId);

      const productSelectFields
        = '_id productId name nameHe nameAr shortDescription shortDescriptionHe shortDescriptionAr description descriptionHe descriptionAr slug images price quantity businessId deliveryArea categories tagsId';
      const productPopulate = [
        { path: 'businessId', select: '_id logo name nameHe nameAr slug' },
      ];
      const baseProductQuery: any = {
        productId: { $in: allProductIds },
        status: CommonStatus.APPROVED,
        isActive: true,
        isDeleted: { $ne: true },
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
        ...(groupTypesId?.length && { groupTypesId: { $in: groupTypesId } }),
        ...(accessibilitiesId?.length && {
          accessibilitiesId: { $in: accessibilitiesId },
        }),
        ...(tagsId?.length && { tagsId: { $in: tagsId } }),
        ...(hasDelivery === true && { 'deliveryArea.0': { $exists: true } }),
        ...(hasDelivery === false && { 'deliveryArea.0': { $exists: false } }),
      };

      let products: any[];

      if (search && searchTerms.length) {
        try {
          const nameFields = ['nameHe', 'name', 'nameAr'];
          const shortDescFields = [
            'shortDescriptionHe',
            'shortDescription',
            'shortDescriptionAr',
          ];
          const shouldClauses: any[] = [];

          const addPhrase = (
            q: string,
            path: string[],
            boost: number,
            slop = 0,
          ) => {
            shouldClauses.push({
              phrase: {
                query: q,
                path,
                ...(slop && { slop }),
                score: { boost: { value: boost } },
              },
            });
          };

          const addFuzzy = (
            q: string,
            path: string[],
            maxEdits: number,
            prefixLength: number,
            boost: number,
          ) => {
            shouldClauses.push({
              text: {
                query: q,
                path,
                fuzzy: { maxEdits, prefixLength },
                score: { boost: { value: boost } },
              },
            });
          };

          const originalTerms = Array.from(
            new Set([search, normalizedBase].filter(Boolean)),
          );
          const originalSet = new Set(originalTerms);
          const filteredExpanded = expandedTerms
            .filter(t => t && !originalSet.has(t))
            .slice(0, 12);

          shouldClauses.push({
            phrase: {
              query: search,
              path: nameFields,
              score: { boost: { value: 10000 } },
            },
          });
          originalTerms.forEach(t => addFuzzy(t, nameFields, 1, 2, 5000));
          filteredExpanded.forEach(t => {
            if (t.includes(' ')) {
              addPhrase(t, nameFields, 3000, 1);
            } else {
              addFuzzy(t, nameFields, 2, 1, 1500);
            }
          });

          shouldClauses.push({
            phrase: {
              query: search,
              path: shortDescFields,
              score: { boost: { value: 1000 } },
            },
          });
          originalTerms.forEach(t => addFuzzy(t, shortDescFields, 1, 2, 500));
          filteredExpanded.forEach(t => {
            if (t.includes(' ')) {
              addPhrase(t, shortDescFields, 300, 1);
            } else {
              addFuzzy(t, shortDescFields, 2, 1, 150);
            }
          });

          originalTerms.forEach(t => addFuzzy(t, ['slug'], 1, 1, 5));
          filteredExpanded.forEach(t => addFuzzy(t, ['slug'], 2, 1, 3));

          const allProductObjectIds = allProductIds
            .filter(id => Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id));

          const noResults = Promise.resolve([] as any[]);
          const [
            atlasResults,
            bizNameResults,
            bizShortDescResults,
            catResults,
            tagResults,
          ] = await Promise.all([
            this.ProductsAuditModel.aggregate([
              {
                $search: {
                  index: PRODUCTS_SEARCH_INDEX,
                  compound: { should: shouldClauses, minimumShouldMatch: 1 },
                },
              },
              {
                $match: {
                  productId: { $in: allProductObjectIds },
                  status: CommonStatus.APPROVED,
                  isActive: true,
                  isDeleted: { $ne: true },
                },
              },
              { $limit: 300 },
              { $project: { productId: 1 } },
            ]),
            buildSearchConditions
              ? this.BusinessModel.find({
                $or: buildSearchConditions(lookupTerms, [
                  'name',
                  'nameHe',
                  'nameAr',
                  'slug',
                ]),
              })
                .select('_id')
                .lean()
                .catch(() => [] as any[])
              : noResults,
            buildSearchConditions
              ? this.BusinessModel.find({
                $or: buildSearchConditions(lookupTerms, [
                  'shortDescription',
                  'shortDescriptionHe',
                  'shortDescriptionAr',
                ]),
              })
                .select('_id')
                .lean()
                .catch(() => [] as any[])
              : noResults,
            buildSearchConditions
              ? this.BussCategoryModel.find({
                $or: buildSearchConditions(lookupTerms, [
                  'name',
                  'hebrewName',
                ]),
              })
                .select('_id')
                .lean()
                .catch(() => [] as any[])
              : noResults,
            buildSearchConditions
              ? this.TagsModel.find({
                $or: buildSearchConditions(lookupTerms, [
                  'name',
                  'nameHe',
                  'nameAr',
                ]),
              })
                .select('_id')
                .lean()
                .catch(() => [] as any[])
              : noResults,
          ]);

          atlasRankedIds = atlasResults.map((r: any) => r.productId.toString());
          matchingBusinessNameIds = bizNameResults;
          matchingBusinessShortDescIds = bizShortDescResults;
          matchingBusinessIds = [
            ...bizNameResults,
            ...bizShortDescResults.filter(
              (b: any) => !bizNameResults.some(
                (n: any) => n._id.toString() === b._id.toString(),
              ),
            ),
          ];
          matchingCategoryIds = catResults;
          matchingTagIds = tagResults;

          if (matchingBusinessIds.length) {
            searchOrConditions.push({
              businessId: { $in: matchingBusinessIds.map((b: any) => b._id) },
            });
          }
          if (catResults.length) {
            searchOrConditions.push({
              categories: { $in: catResults.map((c: any) => c._id) },
            });
          }
          if (tagResults.length) {
            searchOrConditions.push({
              tagsId: { $in: tagResults.map((t: any) => t._id) },
            });
          }

          if (
            atlasRankedIds.length === 0
            && matchingBusinessIds.length === 0
            && catResults.length === 0
            && tagResults.length === 0
          ) {
            throw new Error(
              'Atlas Search returned 0 hits — using regex fallback',
            );
          }

          const searchOrClauses: any[] = [];
          if (atlasRankedIds.length) {
            searchOrClauses.push({ productId: { $in: atlasRankedIds } });
          }
          if (matchingBusinessIds.length) {
            searchOrClauses.push({
              businessId: { $in: matchingBusinessIds.map((b: any) => b._id) },
            });
          }
          if (catResults.length) {
            searchOrClauses.push({
              categories: { $in: catResults.map((c: any) => c._id) },
            });
          }
          if (tagResults.length) {
            searchOrClauses.push({
              tagsId: { $in: tagResults.map((t: any) => t._id) },
            });
          }

          searchTerms
            .filter(t => /[א-ת]/.test(t))
            .slice(0, 4)
            .forEach(term => {
              const r = buildHebrewSearchRegex(term);
              searchOrClauses.push(
                { name: { $regex: r.source, $options: 'i' } },
                { nameHe: { $regex: r.source, $options: 'i' } },
                { nameAr: { $regex: r.source, $options: 'i' } },
                { shortDescriptionHe: { $regex: r.source, $options: 'i' } },
                { shortDescriptionAr: { $regex: r.source, $options: 'i' } },
                { shortDescription: { $regex: r.source, $options: 'i' } },
              );
            });

          products = await this.ProductsAuditModel.find({
            ...baseProductQuery,
            $and: [{ $or: searchOrClauses }],
          })
            .select(productSelectFields)
            .populate(productPopulate)
            .lean();
        } catch (atlasError: any) {
          this.logger.warn(
            `[Topic Search] Atlas Search failed, using regex fallback: ${atlasError?.message}`,
          );
          products = await this.ProductsAuditModel.find({
            ...baseProductQuery,
            ...(searchOrConditions.length > 0 && {
              $and: [{ $or: searchOrConditions }],
            }),
          })
            .select(productSelectFields)
            .populate(productPopulate)
            .lean();
        }
      } else {
        products = await this.ProductsAuditModel.find(baseProductQuery)
          .select(productSelectFields)
          .populate(productPopulate)
          .lean();
      }

      const productMap = new Map(
        products.map(p => [p.productId.toString(), p]),
      );

      const flatList = productCategoryEntries
        .map(({ productId, category }) => {
          const product = productMap.get(productId);
          if (!product) return null;

          const {
            _id,
            productId: pid,
            categories,
            subCategories,
            deliveryArea,
            ...rest
          } = product as any;

          let selectedImage = null;
          if (rest.images?.length) {
            const primary = rest.images.find((img: any) => img.isPrimary);
            const img = primary || rest.images[0];

            if (img) {
              const { subCoordinates, ...cleanImage } = img;
              selectedImage = cleanImage;
            }
          }

          delete rest.images;

          if (rest.businessId) {
            if (rest.businessId.logo) {
              const { subCoordinates, ...cleanLogo } = rest.businessId.logo;
              rest.businessId.logo = cleanLogo;
            }

            rest.businessId.name = getLocalizedValue(
              rest.businessId,
              'name',
              locale as Locale,
            );

            delete rest.businessId.nameHe;
            delete rest.businessId.nameAr;
          }

          const localizedBase = localizeFields(
            { ...rest, _id: pid },
            locale as Locale,
          );

          const localizedCategory = getLocalizedValue(
            category,
            'title',
            locale as Locale,
          );

          return {
            ...localizedBase,
            image: selectedImage,
            category: localizedCategory,
            hasDelivery: Array.isArray(deliveryArea)
              ? deliveryArea.length > 0
              : !!deliveryArea,
          };
        })
        .filter(Boolean);

      const uniqueFlatList = Array.from(
        new Map(flatList.map(item => [item._id.toString(), item])).values(),
      );

      if (
        atlasRankedIds.length > 0
        || matchingBusinessIds.length > 0
        || matchingCategoryIds.length > 0
        || matchingTagIds.length > 0
      ) {
        const atlasRankMap = new Map(atlasRankedIds.map((id, i) => [id, i]));
        const bizNameIdSet = new Set(
          matchingBusinessNameIds.map((b: any) => b._id.toString()),
        );
        const bizShortDescIdSet = new Set(
          matchingBusinessShortDescIds.map((b: any) => b._id.toString()),
        );

        const catIdSet = new Set(
          matchingCategoryIds.map((c: any) => c._id.toString()),
        );
        const tagIdSet = new Set(
          matchingTagIds.map((t: any) => t._id.toString()),
        );

        const productCtxSet = new Set<string>();
        const productBizSet = new Set<string>();
        const productBizShortSet = new Set<string>();

        products.forEach((p: any) => {
          const pid = p.productId.toString();
          if (atlasRankMap.has(pid)) return;

          const bizId
            = p.businessId?._id?.toString() ?? p.businessId?.toString();
          const hasCat = (p.categories || []).some((c: any) => catIdSet.has(c.toString()));
          const hasTag = (p.tagsId || []).some((t: any) => tagIdSet.has(t.toString()));

          if (hasCat || hasTag) {
            productCtxSet.add(pid);
          } else if (bizId && bizNameIdSet.has(bizId)) {
            productBizSet.add(pid);
          } else if (bizId && bizShortDescIdSet.has(bizId)) {
            productBizShortSet.add(pid);
          }
        });

        const getGroupRank = (pid: string): number => {
          if (atlasRankMap.has(pid)) return atlasRankMap.get(pid)!;
          if (productCtxSet.has(pid)) return 500_000;
          if (productBizSet.has(pid)) return 1_000_000;
          if (productBizShortSet.has(pid)) return 1_500_000;
          return Infinity;
        };

        uniqueFlatList.sort(
          (a, b) => getGroupRank(a._id?.toString()) - getGroupRank(b._id?.toString()),
        );
      }

      return paginateData(page, limit, uniqueFlatList);
    } catch (error) {
      this.logger.error('[SITE SETTINGS]: FAILED TO GET PRODUCTS BY TOPIC', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  private async fallbackByPrimaryCategory(
    filters: {
      groupTypesId: string[];
      accessibilitiesId: string[];
      tagsId: string[];
      page: number;
      limit: number;
      locale: Locale;
      search?: string;
    },
    topicNames: string[],
    categoryNames: string[],
    externalApiId: string,
    hasDelivery?: boolean,
    searchOrConditions?: any[],
  ): Promise<any> {
    const {
      groupTypesId, accessibilitiesId, tagsId, page, limit, locale,
    }
      = filters;

    const externalApi = await this.ExternalApiModel.findById(externalApiId)
      .select('name primaryCampIds')
      .lean();
    const campDetails = await this.CampaignModel.findOne({
      _id: externalApi.primaryCampIds[0],
    })
      .select('productIds dmoIds authorityIds businessIds')
      .lean();

    if (
      campDetails !== null
      && !campDetails?.productIds?.length
      && !campDetails?.dmoIds?.length
      && !campDetails?.authorityIds?.length
      && !campDetails?.businessIds?.length
    ) {
      return { data: [] };
    }

    let bussCatIds: any[] = [];
    if (topicNames?.length) {
      const bussCats = await this.BussCategoryModel.find({
        $or: topicNames.flatMap(name => [{ name }, { hebrewName: name }]),
      })
        .select('_id')
        .lean();

      if (!bussCats.length) {
        return [];
      }

      bussCatIds = bussCats.map(c => c._id);
    }

    let tagIds: string[] = [];
    if (categoryNames?.length) {
      const tags = await this.TagsModel.find({
        $or: categoryNames.flatMap(cat => [
          { name: cat },
          { nameHe: cat },
          { nameAr: cat },
        ]),
      })
        .select('_id')
        .lean();

      tagIds = tags.map(t => t._id.toString());
    }

    const campOrConditions: any[] = [];
    if (campDetails?.productIds?.length) {
      campOrConditions.push({ productId: { $in: campDetails.productIds } });
    }
    if (campDetails?.dmoIds?.length) {
      campOrConditions.push({ dmoId: { $in: campDetails.dmoIds } });
    }
    if (campDetails?.authorityIds?.length) {
      campOrConditions.push({ authorityId: { $in: campDetails.authorityIds } });
    }
    if (campDetails?.businessIds?.length) {
      campOrConditions.push({ businessId: { $in: campDetails.businessIds } });
    }

    const andConditions: any[] = [
      {
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
      },
    ];

    if (searchOrConditions?.length) {
      andConditions.push({
        $or: searchOrConditions,
      });
    }

    if (campOrConditions.length) {
      andConditions.push({ $or: campOrConditions });
    }

    const products = await this.ProductsAuditModel.find({
      ...(bussCatIds.length && { primaryCategoryId: { $in: bussCatIds } }),
      status: CommonStatus.APPROVED,
      isActive: true,
      isDeleted: { $ne: true },
      $and: andConditions,
      ...(tagIds.length && { tagsId: { $in: tagIds } }),
      ...(groupTypesId?.length && { groupTypesId: { $in: groupTypesId } }),
      ...(accessibilitiesId?.length && {
        accessibilitiesId: { $in: accessibilitiesId },
      }),
      ...(tagsId?.length && { tagsId: { $in: tagsId } }),
      ...(hasDelivery === true && { 'deliveryArea.0': { $exists: true } }),
      ...(hasDelivery === false && { 'deliveryArea.0': { $exists: false } }),
    })
      .select(
        '_id productId name nameHe nameAr description descriptionHe descriptionAr slug images price quantity businessId deliveryArea',
      )
      .populate([
        { path: 'businessId', select: '_id logo name nameHe nameAr slug' },
      ])
      .lean();

    const flatList = products.map(product => {
      const {
        _id,
        productId: pid,
        categories,
        subCategories,
        deliveryArea,
        ...rest
      } = product as any;

      let selectedImage = null;
      if (rest.images?.length) {
        const primary = rest.images.find((img: any) => img.isPrimary);
        const img: any = primary || rest.images[0];
        if (img) {
          const { subCoordinates, ...cleanImage } = img;
          selectedImage = cleanImage;
        }
      }
      delete rest.images;

      if (rest.businessId) {
        if (rest.businessId.logo) {
          const { subCoordinates, ...cleanLogo } = rest.businessId.logo;
          rest.businessId.logo = cleanLogo;
        }
        rest.businessId.name = getLocalizedValue(
          rest.businessId,
          'name',
          locale,
        );
        delete rest.businessId.nameHe;
        delete rest.businessId.nameAr;
      }

      return {
        ...localizeFields({ ...rest, _id: pid }, locale),
        image: selectedImage,
        hasDelivery: Array.isArray(deliveryArea)
          ? deliveryArea.length > 0
          : !!deliveryArea,
      };
    });

    return paginateData(page, limit, flatList);
  }
}
