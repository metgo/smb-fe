import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Locale } from 'src/common/enum';
import { paginateData } from 'src/common/pagination';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  getLocalizedValue,
  localizeFields,
} from 'src/core/helper/localization.util';
import { GetProductsByTopicQuery } from '../get-products-by-topic.query';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { ProductStatus } from 'src/modules/products/products.type';
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

      const searchRegex = search ? new RegExp(search, 'i') : null;

      const products = await this.ProductsAuditModel.find({
        productId: { $in: allProductIds },
        status: ProductStatus.APPROVED,
        isActive: true,
        isDeleted: { $ne: true },
        $or: [
          { 'quantity.remaining': { $gt: 0 } },
          { 'quantity.isUnlimited': true },
        ],
        ...(searchRegex && {
          $and: [
            {
              $or: [
                { name: searchRegex },
                { nameHe: searchRegex },
                { nameAr: searchRegex },
                { description: searchRegex },
                { descriptionHe: searchRegex },
                { descriptionAr: searchRegex },
                { slug: searchRegex },
              ],
            },
          ],
        }),
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
        new Map(
          flatList.map(item => [item._id.toString(), item]),
        ).values(),
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
  ): Promise<any> {
    const {
      groupTypesId,
      accessibilitiesId,
      tagsId,
      page,
      limit,
      locale,
      search,
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

    const fallbackSearchRegex = search ? new RegExp(search, 'i') : null;

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

    if (fallbackSearchRegex) {
      andConditions.push({
        $or: [
          { name: fallbackSearchRegex },
          { nameHe: fallbackSearchRegex },
          { nameAr: fallbackSearchRegex },
          { description: fallbackSearchRegex },
          { descriptionHe: fallbackSearchRegex },
          { descriptionAr: fallbackSearchRegex },
          { slug: fallbackSearchRegex },
        ],
      });
    }

    if (campOrConditions.length) {
      andConditions.push({ $or: campOrConditions });
    }

    const products = await this.ProductsAuditModel.find({
      ...(bussCatIds.length && { primaryCategoryId: { $in: bussCatIds } }),
      status: ProductStatus.APPROVED,
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
