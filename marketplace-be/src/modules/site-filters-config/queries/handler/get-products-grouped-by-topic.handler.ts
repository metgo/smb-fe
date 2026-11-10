import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Model } from 'mongoose';

import { CommonStatus, Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { shuffleArray } from 'src/common/utils/shuffle';
import {
  getLocalizedValue,
  localizeFields,
} from 'src/core/helper/localization.util';
import { GetProductsGroupedByTopicQuery } from '../get-products-grouped-by-topic.query';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { Campaign } from 'src/modules/campaign/schema/campaign.schema';
import { CacheService } from 'src/services/cache/cache.service';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { PromotionOrdersService } from 'src/modules/promotion-orders/promotion-orders.service';
import { PromotionStatusResponse } from 'src/modules/promotion-orders/promotion-orders.type';
import { applyLionCoinStatus } from 'src/modules/promotion-orders/promotion-orders.utils';

const PRODUCTS_PER_TOPIC = 4;
const CACHE_TTL = 20;

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
    private ExternalApiModule: Model<ExternalApi>,
    @InjectModel(Campaign.name)
    private CampaignModel: Model<Campaign>,
    private readonly cacheService: CacheService,
    private readonly promotionOrdersService: PromotionOrdersService,
  ) {}

  // isAlreadyRedeemed is baked into this cached response like every other
  // business field here (price, approval status, etc.) - same CACHE_TTL
  // staleness window applies, not a special exception for this one field.
  private async getLionCoinStatusByBusinessId(
    products: any[],
  ): Promise<Map<string, PromotionStatusResponse>> {
    const businessIds = [...new Set(
      products
        .map(p => (p.businessId as any)?._id?.toString())
        .filter(Boolean),
    )];

    if (!businessIds.length) return new Map();

    const statuses = await this.promotionOrdersService.getStatusForBusinesses(businessIds);
    return new Map(statuses.map(status => [status.businessId, status]));
  }

  async execute({
    siteSettingId,
    query,
  }: GetProductsGroupedByTopicQuery): Promise<any> {
    const { locale } = query;

    const cacheKey = `products-grouped:${siteSettingId}:${locale || 'default'}`;

    const cached = this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    try {
      const siteSettings = await this.SiteFiltersConfigModel.findOne({
        externalApiId: siteSettingId,
        status: SiteFiltersConfigStatus.APPROVED,
      })
        .select('siteTopics')
        .lean();

      const activeTopics = (siteSettings?.siteTopics || []).filter(
        t => !t.isArchived,
      );

      let result;

      if (activeTopics.length) {
        result = await this.groupByTopics(activeTopics, locale as Locale);
      } else {
        result = await this.groupByPrimaryCategory(
          siteSettingId,
          locale as Locale,
        );
      }

      this.cacheService.set(cacheKey, result, CACHE_TTL);

      return result;
    } catch (error) {
      this.logger.error(
        '[SITE SETTINGS]: FAILED TO GET PRODUCTS GROUPED BY TOPIC',
        { err: error.message },
      );
      exceptionHandling(error);
    }
  }

  private async groupByTopics(activeTopics: any[], locale: Locale) {
    const productEntries: any[] = [];

    activeTopics.forEach((topic, topicIndex) => {
      (topic.siteCategories || [])
        .filter(cat => !cat.isArchived)
        .forEach(cat => {
          (cat.productIds || []).forEach(pid => {
            productEntries.push({
              topicIndex,
              productId: pid.toString(),
              category: cat,
            });
          });
        });
    });

    if (!productEntries.length) {
      return activeTopics.map(topic => ({
        topics: getLocalizedValue(topic, 'title', locale),
        icon: topic.icon ?? null,
        colors: topic.colors ?? [],
        products: [],
      }));
    }

    const allProductIds = [...new Set(productEntries.map(e => e.productId))];

    const products = await this.ProductsAuditModel.find({
      productId: { $in: allProductIds },
      status: CommonStatus.APPROVED,
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { 'quantity.remaining': { $gt: 0 } },
        { 'quantity.isUnlimited': true },
      ],
    })
      .select(
        '_id productId name nameHe nameAr slug description descriptionHe descriptionAr shortDescription shortDescriptionHe shortDescriptionAr images price quantity businessId',
      )
      .populate([
        {
          path: 'businessId',
          select:
            '_id logo name nameHe nameAr slug deliveryArea isPickUpAvailable vendorDelivers vendorDeliveryArea globalDelivery globalDeliveryArea geoLocation status isDeleted',
        },
      ])
      .lean();

    const filteredProducts = products.filter(p => {
      const business = p.businessId as any;
      return (
        business
        && business.status === CommonStatus.APPROVED
        && !business.isDeleted
      );
    });

    const productMap = new Map(
      filteredProducts.map(p => [p.productId.toString(), p]),
    );

    const lionCoinStatusByBusinessId = await this.getLionCoinStatusByBusinessId(filteredProducts);

    const tempMap = new Map<number, any[]>();
    activeTopics.forEach((_, i) => tempMap.set(i, []));

    productEntries.forEach(({ topicIndex, productId, category }) => {
      const product = productMap.get(productId);
      if (!product) return;

      tempMap
        .get(topicIndex)
        .push(this.formatProduct(product, category, locale, lionCoinStatusByBusinessId));
    });

    const topicProductsMap = new Map<number, any[]>();

    tempMap.forEach((items, topicIndex) => {
      const shuffled = shuffleArray(items);
      topicProductsMap.set(topicIndex, shuffled.slice(0, PRODUCTS_PER_TOPIC));
    });

    return activeTopics.map((topic, i) => ({
      topics: getLocalizedValue(topic, 'title', locale),
      icon: topic.icon ?? null,
      colors: topic.colors ?? [],
      products: topicProductsMap.get(i),
    }));
  }

  private async groupByPrimaryCategory(siteSettingId: string, locale: Locale) {
    const siteSetting = await this.ExternalApiModule.findById(siteSettingId)
      .select('primaryCampIds')
      .lean();

    const campDetails = await this.CampaignModel.findById(
      siteSetting?.primaryCampIds?.[0],
    )
      .select('productIds dmoIds authorityIds businessIds')
      .lean();

    if (
      campDetails
      && !campDetails.productIds?.length
      && !campDetails.dmoIds?.length
      && !campDetails.authorityIds?.length
      && !campDetails.businessIds?.length
    ) {
      return [];
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

    const findQuery = {
      status: CommonStatus.APPROVED,
      isActive: true,
      isDeleted: { $ne: true },

      $and: [
        ...(campOrConditions.length ? [{ $or: campOrConditions }] : []),

        {
          $or: [
            { 'quantity.remaining': { $gt: 0 } },
            { 'quantity.isUnlimited': true },
          ],
        },
      ],
    };

    const products = await this.ProductsAuditModel.find(findQuery)
      .select(
        '_id productId name nameHe nameAr slug description descriptionHe descriptionAr shortDescription shortDescriptionHe shortDescriptionAr images price quantity businessId primaryCategoryId',
      )
      .populate([
        {
          path: 'businessId',
          select:
            '_id logo name nameHe nameAr slug status isDeleted deliveryArea isPickUpAvailable vendorDelivers globalDelivery globalDeliveryArea geoLocation',
        },
        { path: 'primaryCategoryId', select: 'name hebrewName' },
      ])
      .lean();

    const filteredProducts = products.filter(p => {
      const business = p.businessId as any;
      return (
        business
        && business.status === CommonStatus.APPROVED
        && !business.isDeleted
      );
    });

    const groupMap = new Map<string, any[]>();

    filteredProducts.forEach(product => {
      const cat = product.primaryCategoryId as any;
      if (!cat) return;

      const catId = cat._id.toString();

      if (!groupMap.has(catId)) {
        groupMap.set(catId, []);
      }

      groupMap.get(catId).push(product);
    });

    const lionCoinStatusByBusinessId = await this.getLionCoinStatusByBusinessId(filteredProducts);

    // eslint-disable-next-line no-unused-vars
    return [...groupMap.entries()].map(([_, items]) => {
      const shuffled = shuffleArray(items).slice(0, PRODUCTS_PER_TOPIC);

      return {
        topics:
          locale === Locale.HEBREW
            ? items[0].primaryCategoryId?.hebrewName
              || items[0].primaryCategoryId?.name
            : items[0].primaryCategoryId?.name,
        products: shuffled.map(p => this.formatProduct(p, null, locale, lionCoinStatusByBusinessId)),
      };
    });
  }

  private formatProduct(
    product: any,
    category: any,
    locale: Locale,
    lionCoinStatusByBusinessId?: Map<string, PromotionStatusResponse>,
  ) {
    const { productId: pid, ...rest } = product;

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

      rest.businessId.vendorDelivers = rest.businessId.vendorDelivers ?? false;
      rest.businessId.globalDelivery = rest.businessId.globalDelivery ?? false;
      rest.businessId.globalDeliveryArea
        = rest.businessId.globalDeliveryArea ?? [];

      // Lion Coin counter ("N of 5 left") + all-redeemed badge - from DB, never manual.
      applyLionCoinStatus(rest.businessId, lionCoinStatusByBusinessId?.get(rest.businessId._id?.toString()));
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
