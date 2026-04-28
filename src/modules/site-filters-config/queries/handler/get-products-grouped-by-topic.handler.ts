import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Model } from 'mongoose';

import { Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import {
  getLocalizedValue,
  localizeFields,
} from 'src/core/helper/localization.util';
import { GetProductsGroupedByTopicQuery } from '../get-products-grouped-by-topic.query';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { ProductStatus } from 'src/modules/products/products.type';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';

const PRODUCTS_PER_TOPIC = 4;

@QueryHandler(GetProductsGroupedByTopicQuery)
export class GetProductsGroupedByTopicHandler
implements IQueryHandler<GetProductsGroupedByTopicQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteFiltersConfig.name)
    private SiteFiltersConfigModel: Model<SiteFiltersConfig>,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    @InjectModel(ExternalApi.name)
    private ExternalApiModel: Model<ExternalApi>,
  ) {}

  async execute({
    externalApiId,
    query,
  }: GetProductsGroupedByTopicQuery): Promise<any> {
    const { locale } = query;

    try {
      const siteSettings = await this.SiteFiltersConfigModel.findOne({
        externalApiId,
        status: SiteFiltersConfigStatus.APPROVED,
      })
        .select('siteTopics')
        .lean();

      const activeTopics = (siteSettings?.siteTopics || []).filter(
        t => !t.isArchived,
      );

      if (activeTopics.length) {
        return this.groupByTopics(activeTopics, locale as Locale);
      }

      return this.groupByPrimaryCategory(externalApiId, locale as Locale);
    } catch (error) {
      this.logger.error(
        '[SITE SETTINGS]: FAILED TO GET PRODUCTS GROUPED BY TOPIC',
        { err: error.message },
      );
      exceptionHandling(error);
    }
  }

  private async groupByTopics(activeTopics: any[], locale: Locale) {
    type ProductEntry = {
      topicIndex: number;
      productId: string;
      category: { title: string; titleHe: string; titleAr: string };
    };

    const productEntries: ProductEntry[] = [];
    const topicProductCount = new Array(activeTopics.length).fill(0);

    activeTopics.forEach((topic, topicIndex) => {
      (topic.siteCategories || [])
        .filter(cat => !cat.isArchived)
        .forEach(cat => {
          (cat.productIds || []).forEach(pid => {
            if (topicProductCount[topicIndex] < PRODUCTS_PER_TOPIC) {
              productEntries.push({
                topicIndex,
                productId: pid.toString(),
                category: {
                  title: cat.title,
                  titleHe: cat.titleHe,
                  titleAr: cat.titleAr,
                },
              });
              topicProductCount[topicIndex]++;
            }
          });
        });
    });

    if (!productEntries.length) {
      return activeTopics.map(topic => ({
        topic: getLocalizedValue(topic, 'title', locale),
        products: [],
      }));
    }

    const allProductIds = [...new Set(productEntries.map(e => e.productId))];

    const products = await this.ProductsAuditModel.find({
      productId: { $in: allProductIds },
      status: ProductStatus.APPROVED,
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { 'quantity.remaining': { $gt: 0 } },
        { 'quantity.isUnlimited': true },
      ],
    })
      .select(
        '_id productId name nameHe nameAr slug shortDescription shortDescriptionHe shortDescriptionAr images price quantity businessId',
      )
      .populate([
        { path: 'businessId', select: '_id logo name nameHe nameAr slug' },
      ])
      .lean();

    const productMap = new Map(
      products.map(p => [p.productId.toString(), p]),
    );

    const topicProductsMap = new Map<number, any[]>();
    activeTopics.forEach((_, i) => topicProductsMap.set(i, []));

    productEntries.forEach(({ topicIndex, productId, category }) => {
      const product = productMap.get(productId);
      if (!product) return;
      topicProductsMap
        .get(topicIndex)
        .push(this.formatProduct(product, category, locale));
    });

    return activeTopics.map((topic, i) => ({
      topics: getLocalizedValue(topic, 'title', locale),
      products: topicProductsMap.get(i),
    }));
  }

  private async groupByPrimaryCategory(externalApiId: string, locale: Locale) {
    const externalApi = await this.ExternalApiModel.findById(externalApiId)
      .select('categoryIds')
      .lean();

    if (!externalApi?.categoryIds?.length) {
      return [];
    }

    const products = await this.ProductsAuditModel.find({
      primaryCategoryId: { $in: externalApi.categoryIds },
      status: ProductStatus.APPROVED,
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { 'quantity.remaining': { $gt: 0 } },
        { 'quantity.isUnlimited': true },
      ],
    })
      .select(
        '_id productId name nameHe nameAr slug shortDescription shortDescriptionHe shortDescriptionAr images price quantity businessId primaryCategoryId',
      )
      .populate([
        { path: 'businessId', select: '_id logo name nameHe nameAr slug' },
        { path: 'primaryCategoryId', select: 'name hebrewName' },
      ])
      .lean();

    const groupMap = new Map<string, { categoryName: string; items: any[] }>();

    products.forEach(product => {
      const cat = product.primaryCategoryId as any;
      if (!cat) return;

      const catId = cat._id.toString();

      if (!groupMap.has(catId)) {
        const categoryName
          = locale === Locale.HEBREW ? cat.hebrewName || cat.name : cat.name;
        groupMap.set(catId, { categoryName, items: [] });
      }

      const group = groupMap.get(catId);
      if (group.items.length >= PRODUCTS_PER_TOPIC) return;

      group.items.push(this.formatProduct(product, null, locale));
    });

    return [...groupMap.values()].map(({ categoryName, items }) => ({
      topics: categoryName,
      products: items,
    }));
  }

  private formatProduct(product: any, category: any, locale: Locale) {
    const {
      _id,
      productId: pid,
      categories,
      subCategories,
      primaryCategoryId,
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
      rest.businessId.name = getLocalizedValue(rest.businessId, 'name', locale);
      delete rest.businessId.nameHe;
      delete rest.businessId.nameAr;
    }

    const localizedBase = localizeFields({ ...rest, _id: pid }, locale);

    return {
      ...localizedBase,
      image: selectedImage,
      ...(category && {
        category: getLocalizedValue(category, 'title', locale),
      }),
    };
  }
}
