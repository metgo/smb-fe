import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
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
} from 'src/core/helper/atlas-search.util';
import { GetProductsByTopicQuery } from '../get-products-by-topic.query';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { Model } from 'mongoose';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

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
      let matchingCategoryIds: any[] = [];
      let matchingTagIds: any[] = [];

      if (search) {
        const normalizedBase = normalizeHebrewSearch(search);
        const apiKey = this.configService.get('GEMINI_API_KEY');
        expandedTerms = await expandSearchTerms(normalizedBase, apiKey);
        searchTerms = [search, ...expandedTerms].filter((t, i, arr) => t && arr.indexOf(t) === i);

        const regexes = expandedTerms.map(term => buildHebrewSearchRegex(term));
        searchOrConditions = regexes.flatMap(regex => [
          { name: regex },
          { nameHe: regex },
          { nameAr: regex },
          { description: regex },
          { descriptionHe: regex },
          { descriptionAr: regex },
          { slug: regex },
        ]);

        // contextual category lookup
        try {
          const categoryOrQueries = searchTerms.map(t => {
            const r = buildHebrewSearchRegex(t);
            return [
              { name: { $regex: r.source, $options: 'i' } },
              { hebrewName: { $regex: r.source, $options: 'i' } },
            ];
          }).flat();
          matchingCategoryIds = await this.BussCategoryModel.find({ $or: categoryOrQueries }).select('_id');
        } catch (catError: any) {
          this.logger.warn(`[Topic Search] Category lookup failed: ${catError?.message}`);
        }

        // contextual tag lookup
        try {
          const tagOrQueries = searchTerms.map(t => {
            const r = buildHebrewSearchRegex(t);
            return [
              { name: { $regex: r.source, $options: 'i' } },
              { nameHe: { $regex: r.source, $options: 'i' } },
              { nameAr: { $regex: r.source, $options: 'i' } },
            ];
          }).flat();
          matchingTagIds = await this.TagsModel.find({ $or: tagOrQueries }).select('_id');
        } catch (tagError: any) {
          this.logger.warn(`[Topic Search] Tag lookup failed: ${tagError?.message}`);
        }

        if (matchingCategoryIds.length) {
          searchOrConditions.push({ categories: { $in: matchingCategoryIds.map(c => c._id) } });
        }
        if (matchingTagIds.length) {
          searchOrConditions.push({ tagsId: { $in: matchingTagIds.map(t => t._id) } });
        }
      }
      const siteSettings = await this.SiteFiltersConfigModel.findOne({
        externalApiId,
        status: SiteFiltersConfigStatus.APPROVED,
      })
        .select('siteTopics')
        .lean();

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
        return this.fallbackByPrimaryCategory(
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

      const productSelectFields = '_id productId name nameHe nameAr description descriptionHe descriptionAr slug images price quantity businessId deliveryArea';
      const productPopulate = [{ path: 'businessId', select: '_id logo name nameHe nameAr slug' }];
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
        ...(accessibilitiesId?.length && { accessibilitiesId: { $in: accessibilitiesId } }),
        ...(tagsId?.length && { tagsId: { $in: tagsId } }),
        ...(hasDelivery === true && { 'deliveryArea.0': { $exists: true } }),
        ...(hasDelivery === false && { 'deliveryArea.0': { $exists: false } }),
      };

      let products: any[];

      if (search && searchTerms.length) {
        try {
          //  Atlas Search — fuzzy matching + relevance scoring
          const searchPaths = ['name', 'nameHe', 'nameAr', 'description', 'descriptionHe', 'descriptionAr'];
          const shouldClauses: any[] = searchTerms.map((term, index) => {
            const isHighPriority = index <= 1;
            if (term.includes(' ')) {
              return {
                phrase: {
                  query: term,
                  path: searchPaths,
                  slop: 1,
                  ...(isHighPriority && { score: { boost: { value: 10 } } }),
                },
              };
            }
            return {
              text: {
                query: term,
                path: searchPaths,
                fuzzy: { maxEdits: 2, prefixLength: 1 },
                ...(isHighPriority && { score: { boost: { value: 10 } } }),
              },
            };
          });

          matchingCategoryIds.forEach(cat => shouldClauses.push({
            text: { query: cat._id.toString(), path: ['categories'] },
          }));
          matchingTagIds.forEach(tag => shouldClauses.push({
            text: { query: tag._id.toString(), path: ['tagsId'] },
          }));

          // Step 1: get relevance-ranked IDs from Atlas Search
          const atlasResults = await this.ProductsAuditModel.aggregate([
            {
              $search: {
                index: PRODUCTS_SEARCH_INDEX,
                compound: { should: shouldClauses, minimumShouldMatch: 1 },
              },
            },
            {
              $match: {
                productId: { $in: allProductIds },
                status: CommonStatus.APPROVED,
                isActive: true,
                isDeleted: { $ne: true },
              },
            },
            { $project: { productId: 1 } },
          ]);

          const atlasProductIds = atlasResults.map((r: any) => r.productId.toString());

          // Step 2: fetch full documents with populate using Atlas-matched IDs
          products = await this.ProductsAuditModel.find({
            ...baseProductQuery,
            productId: { $in: atlasProductIds },
          })
            .select(productSelectFields)
            .populate(productPopulate)
            .lean();
        } catch (atlasError: any) {
          this.logger.warn(`[Topic Search] Atlas Search failed, using regex fallback: ${atlasError?.message}`);
          products = await this.ProductsAuditModel.find({
            ...baseProductQuery,
            ...(searchOrConditions.length > 0 && { $and: [{ $or: searchOrConditions }] }),
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

      const flatList = (
        await Promise.all(
          productCategoryEntries.map(async ({ productId, category }) => {
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
              const primary = rest.images.find(img => img.isPrimary);
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
          }),
        )
      ).filter(Boolean);

      const uniqueFlatList = Array.from(
        new Map(flatList.map(item => [item._id.toString(), item])).values(),
      );

      const paginatedData = paginateData(page, limit, uniqueFlatList);
      return paginatedData;
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
      groupTypesId,
      accessibilitiesId,
      tagsId,
      page,
      limit,
      locale,
    } = filters;

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
