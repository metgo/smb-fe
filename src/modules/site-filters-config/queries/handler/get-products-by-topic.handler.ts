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

      if (siteSettings) {
        if (query.topic?.length) {
          const matchedTopics = (siteSettings.siteTopics || []).filter(t => query.topic.some(
            tp => t.title === tp || t.titleHe === tp || t.titleAr === tp,
          ));
          this.logger.debug(
            `Found ${matchedTopics.length} topic(s) for "${query.topic.join(
              ', ',
            )}"`,
          );

          if (!matchedTopics.length) {
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
              hasDelivery,
            );
          }

          siteCategories = matchedTopics.flatMap(t => t.siteCategories || []);
        } else {
          siteCategories = (siteSettings.siteTopics || []).flatMap(
            t => t.siteCategories || [],
          );
        }
      } else if (query.topic?.length) {
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

            // ✅ Pick single image
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

            // ✅ Clean & localize business
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

            // ✅ Localize product fields (name, description)
            const localizedBase = localizeFields(
              { ...rest, _id: pid },
              locale as Locale,
            );

            // ✅ Localize category
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

      const paginatedData = await paginateData(page, limit, flatList);
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

    const bussCats = await this.BussCategoryModel.find({
      $or: topicNames.flatMap(name => [{ name }, { hebrewName: name }]),
    })
      .select('_id')
      .lean();

    if (!bussCats.length) {
      return [];
    }

    const bussCatIds = bussCats.map(c => c._id);

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

    const products = await this.ProductsAuditModel.find({
      primaryCategoryId: { $in: bussCatIds },
      status: ProductStatus.APPROVED,
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { 'quantity.remaining': { $gt: 0 } },
        { 'quantity.isUnlimited': true },
      ],
      ...(fallbackSearchRegex && {
        $and: [
          {
            $or: [
              { name: fallbackSearchRegex },
              { nameHe: fallbackSearchRegex },
              { nameAr: fallbackSearchRegex },
              { description: fallbackSearchRegex },
              { descriptionHe: fallbackSearchRegex },
              { descriptionAr: fallbackSearchRegex },
              { slug: fallbackSearchRegex },
            ],
          },
        ],
      }),
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
