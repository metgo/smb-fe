import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Model } from 'mongoose';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { GetSiteFiltersConfigByIdentifierIdQuery } from '../get-site-filters-config-by-identifierId.query';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';
import { ProductsAudit } from 'src/modules/products/schema/products-audit.schema';
import { BusinessesAudit } from 'src/modules/business/shared/schema/businesses-audit.schema';

@QueryHandler(GetSiteFiltersConfigByIdentifierIdQuery)
export class GetSiteFiltersConfigByIdentifierIdHandler
implements IQueryHandler<GetSiteFiltersConfigByIdentifierIdQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteFiltersConfig.name)
    private SiteFiltersConfigModel: Model<SiteFiltersConfig>,
    @InjectModel(ExternalApi.name)
    private ExternalApiModel: Model<ExternalApi>,
    @InjectModel(ProductsAudit.name)
    private ProductsAuditModel: Model<ProductsAudit>,
    @InjectModel(BusinessesAudit.name)
    private BusinessesAuditModel: Model<BusinessesAudit>,
  ) {}

  async execute(queries: GetSiteFiltersConfigByIdentifierIdQuery) {
    try {
      const { identifierId, query } = queries;

      const externalApi = await this.ExternalApiModel.findOne({
        identifierId,
      }).select('_id');

      if (!externalApi) {
        throw new NotFoundException(`SITE ${ServerErrors.NOT_FOUND}`);
      }

      if (query.isMarketplace) {
        const select
          = 'header headerDescription headerHe headerDescriptionHe headerAr headerDescriptionAr siteTopics';

        const populate = [
          {
            path: 'siteTopics.siteCategories.productIds',
            select:
              'name nameHe nameAr slug description descriptionHe descriptionAr shortDescription shortDescriptionHe shortDescriptionAr images price groupTypesId accessibilitiesId tagsId',
            populate: {
              path: 'businessId',
              select: 'name nameHe nameAr logo slug geoLocation',
            },
          },
        ];
        const siteSettings = await this.SiteFiltersConfigModel.findOne({
          externalApiId: externalApi._id,
          status: SiteFiltersConfigStatus.APPROVED,
        })
          .select(select)
          .populate(populate);

        if (!siteSettings) {
          throw new NotFoundException(
            `SITE SETTINGS ${ServerErrors.NOT_FOUND}`,
          );
        }

        const result = siteSettings.toObject();

        // Collect all product IDs and unique business IDs from all categories
        const allProductIds: string[] = [];
        const allBusinessIds: string[] = [];
        const businessIdSet = new Set<string>();
        (result.siteTopics || []).forEach((topic: any) => {
          (topic.siteCategories || []).forEach((cat: any) => {
            (cat.productIds || []).forEach((product: any) => {
              if (product?._id) allProductIds.push(product._id.toString());
              if (product?.businessId?._id) {
                const bid = product.businessId._id.toString();
                if (!businessIdSet.has(bid)) {
                  businessIdSet.add(bid);
                  allBusinessIds.push(bid);
                }
              }
            });
          });
        });

        // Fetch active product audits and build a map keyed by productId
        const productAudits = await this.ProductsAuditModel.find({
          productId: { $in: allProductIds },
          isActive: true,
        })
          .select(
            'productId name nameHe nameAr slug description descriptionHe descriptionAr shortDescription shortDescriptionHe shortDescriptionAr images price groupTypesId accessibilitiesId tagsId deliveryArea',
          )
          .lean();
        const productAuditMap = new Map<string, any>(
          productAudits.map(a => [a.productId.toString(), a]),
        );

        // Fetch active business audits and build a map keyed by businessId
        const businessAudits = await this.BusinessesAuditModel.find({
          businessId: { $in: allBusinessIds },
          isActive: true,
        })
          .select('businessId name nameHe nameAr logo slug geoLocation')
          .lean();
        const businessAuditMap = new Map<string, any>(
          businessAudits.map(a => [a.businessId.toString(), a]),
        );

        if (query.categoryName) {
          const allCategories = (result.siteTopics || []).flatMap(
            (topic: any) => topic.siteCategories || [],
          );
          const matchedCat = allCategories.find(
            (cat: any) => cat.title?.toLowerCase() === query.categoryName.toLowerCase(),
          );
          if (!matchedCat) return [];
          const shuffled = (matchedCat.productIds || [])
            .sort(() => Math.random() - 0.5)
            .map((product: any) => this.localizeProduct(
              this.applyProductAudit(
                product,
                productAuditMap,
                businessAuditMap,
              ),
              query.locale,
            ));
          return shuffled;
        }

        const { locale } = query;

        const localizedHeader = this.localizeString(
          { base: result.header, he: result.headerHe, ar: result.headerAr },
          locale,
        );
        const localizedHeaderDescription = this.localizeString(
          {
            base: result.headerDescription,
            he: result.headerDescriptionHe,
            ar: result.headerDescriptionAr,
          },
          locale,
        );

        result.header = localizedHeader;
        result.headerDescription = localizedHeaderDescription;
        delete result.headerHe;
        delete result.headerAr;
        delete result.headerDescriptionHe;
        delete result.headerDescriptionAr;

        result.siteTopics = (result.siteTopics || [])
          .filter((topic: any) => !topic.isArchived)
          .map((topic: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const {
              titleHe,
              titleAr,
              descriptionHe,
              descriptionAr,
              ...topicRest
            } = topic;
            return {
              ...topicRest,
              title: this.localizeString(
                { base: topic.title, he: titleHe, ar: titleAr },
                locale,
              ),
              description: this.localizeString(
                {
                  base: topic.description,
                  he: descriptionHe,
                  ar: descriptionAr,
                },
                locale,
              ),
              siteCategories: (topic.siteCategories || [])
                .filter(
                  (cat: any) => !cat.isArchived && (cat.productIds || []).length > 0,
                )
                .map((cat: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const {
                    businessIds,
                    eventIds,
                    poiIds,
                    tripIds,
                    fundayIds,
                    titleHe: catTitleHe,
                    titleAr: catTitleAr,
                    descriptionHe: catDescHe,
                    descriptionAr: catDescAr,
                    ...catRest
                  } = cat;

                  const allProducts = cat.productIds || [];
                  const isShowMore = allProducts.length > 4;
                  const shuffledProducts = [...allProducts]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4)
                    .map((product: any) => this.localizeProduct(
                      this.applyProductAudit(
                        product,
                        productAuditMap,
                        businessAuditMap,
                      ),
                      locale,
                    ));

                  return {
                    ...catRest,
                    title: this.localizeString(
                      { base: cat.title, he: catTitleHe, ar: catTitleAr },
                      locale,
                    ),
                    description: this.localizeString(
                      { base: cat.description, he: catDescHe, ar: catDescAr },
                      locale,
                    ),
                    productIds: shuffledProducts,
                    isShowMore,
                  };
                }),
            };
          });

        return result;
      }

      const select
        = 'header headerDescription headerHe headerDescriptionHe headerAr headerDescriptionAr siteTopics';
      const siteSettings = await this.SiteFiltersConfigModel.findOne({
        externalApiId: externalApi._id,
        status: SiteFiltersConfigStatus.APPROVED,
      }).select(select);

      if (!siteSettings) {
        throw new NotFoundException(`SITE SETTINGS ${ServerErrors.NOT_FOUND}`);
      }
      // await this.SiteFiltersConfigModel.populate(siteSettings, [
      //   {
      //     path: 'siteTopics.siteCategories.businessIds siteTopics.siteCategories.poiIds',
      //     select:
      //       'slug name nameHe
      // nameAr shortDescription shortDescriptionHe
      // shortDescriptionAr geoLocation images primaryCategoryId groupTypesId accessibilitiesId tagsId address'
      //   },
      //   {
      //     path: 'siteTopics.siteCategories.eventIds',
      //     select:
      //       'slug name shortDescription geoLocation images primaryCategoryId groupTypesId accessibilitiesId address',
      //   },
      //   {
      //     path: 'siteTopics.siteCategories.tripIds siteTopics.siteCategories.fundayIds',
      //     select:
      //       'slug name shortDescription images groupTypesId accessibilitiesId',
      //   },
      //   {
      //     path: 'siteTopics.siteCategories.productIds',
      //     select:
      //       'slug name nameHe
      // nameAr shortDescription
      // shortDescriptionHe shortDescriptionAr images primaryCategoryId groupTypesId accessibilitiesId tagsId address',
      //   },
      // ]);

      this.logger.info('[SITE SETTINGS]: SITE SETTINGS FOUND', {
        siteSettingsId: siteSettings._id,
      });

      const { locale } = query;
      const result = siteSettings.toObject();

      result.header = this.localizeString(
        { base: result.header, he: result.headerHe, ar: result.headerAr },
        locale,
      );
      result.headerDescription = this.localizeString(
        {
          base: result.headerDescription,
          he: result.headerDescriptionHe,
          ar: result.headerDescriptionAr,
        },
        locale,
      );
      delete result.headerHe;
      delete result.headerAr;
      delete result.headerDescriptionHe;
      delete result.headerDescriptionAr;

      result.siteTopics = (result.siteTopics || [])
        .filter((topic: any) => !topic.isArchived)
        .map((topic: any) => {
          const {
            titleHe,
            titleAr,
            descriptionHe,
            descriptionAr,
            ...topicRest
          } = topic;
          return {
            ...topicRest,
            title: this.localizeString(
              { base: topic.title, he: titleHe, ar: titleAr },
              locale,
            ),
            description: this.localizeString(
              { base: topic.description, he: descriptionHe, ar: descriptionAr },
              locale,
            ),
            siteCategories: (topic.siteCategories || [])
              .filter((cat: any) => !cat.isArchived)
              .map((cat: any) => {
                const {
                  titleHe: catTitleHe,
                  titleAr: catTitleAr,
                  descriptionHe: catDescHe,
                  descriptionAr: catDescAr,
                  ...catRest
                } = cat;
                return {
                  ...catRest,
                  title: this.localizeString(
                    { base: cat.title, he: catTitleHe, ar: catTitleAr },
                    locale,
                  ),
                  description: this.localizeString(
                    { base: cat.description, he: catDescHe, ar: catDescAr },
                    locale,
                  ),
                };
              }),
          };
        });

      return result;
    } catch (error) {
      this.logger.error('[SITE SETTINGS]: FAILED TO GET SITE SETTINGS', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }

  private applyProductAudit(
    product: any,
    productAuditMap: Map<string, any>,
    businessAuditMap: Map<string, any>,
  ): any {
    const productAudit = product?._id
      ? productAuditMap.get(product._id.toString())
      : null;

    const merged = productAudit
      ? {
        ...product,
        name: productAudit.name ?? product.name,
        nameHe: productAudit.nameHe ?? product.nameHe,
        nameAr: productAudit.nameAr ?? product.nameAr,
        slug: productAudit.slug ?? product.slug,
        description: productAudit.description ?? product.description,
        descriptionHe: productAudit.descriptionHe ?? product.descriptionHe,
        descriptionAr: productAudit.descriptionAr ?? product.descriptionAr,
        shortDescription:
            productAudit.shortDescription ?? product.shortDescription,
        shortDescriptionHe:
            productAudit.shortDescriptionHe ?? product.shortDescriptionHe,
        shortDescriptionAr:
            productAudit.shortDescriptionAr ?? product.shortDescriptionAr,
        images: productAudit.images ?? product.images,
        price: productAudit.price ?? product.price,
        deliveryArea: productAudit.deliveryArea ?? product.deliveryArea,
      }
      : product;

    if (!merged?.businessId?._id) return merged;

    const businessAudit = businessAuditMap.get(
      merged.businessId._id.toString(),
    );
    if (!businessAudit) return merged;

    return {
      ...merged,
      businessId: {
        ...merged.businessId,
        name: businessAudit.name ?? merged.businessId.name,
        nameHe: businessAudit.nameHe ?? merged.businessId.nameHe,
        nameAr: businessAudit.nameAr ?? merged.businessId.nameAr,
        logo: businessAudit.logo ?? merged.businessId.logo,
        slug: businessAudit.slug ?? merged.businessId.slug,
      },
    };
  }

  private localizeString(
    { base, he, ar }: { base: string; he: string; ar: string },
    locale: Locale,
  ): string {
    switch (locale) {
      case Locale.ARABIC:
        return ar || base || he;
      case Locale.HEBREW:
        return he || base || ar;
      case Locale.ENGLISH:
        return base || he || ar;
      default:
        return base;
    }
  }

  private localizeProduct(item: any, locale: Locale) {
    const {
      nameAr,
      descriptionAr,
      shortDescriptionAr,
      name,
      description,
      shortDescription,
      nameHe,
      descriptionHe,
      shortDescriptionHe,
      businessId,
      images,
      deliveryArea,
      ...rest
    } = item;

    const hasDelivery = Array.isArray(deliveryArea) && deliveryArea.length > 0;

    const primaryImage
      = images?.find((img: any) => img.isPrimary) ?? images?.[0] ?? null;

    const localizedBusiness = businessId
      ? this.localizeBusiness(businessId, locale)
      : businessId;

    switch (locale) {
      case Locale.ARABIC:
        return {
          ...rest,
          name: nameAr || name || nameHe,
          description: descriptionAr || description || descriptionHe,
          shortDescription:
            shortDescriptionAr || shortDescription || shortDescriptionHe,
          businessId: localizedBusiness,
          image: primaryImage,
          hasDelivery,
        };
      case Locale.HEBREW:
        return {
          ...rest,
          name: nameHe || name || nameAr,
          description: descriptionHe || description || descriptionAr,
          shortDescription:
            shortDescriptionHe || shortDescription || shortDescriptionAr,
          businessId: localizedBusiness,
          image: primaryImage,
          hasDelivery,
        };
      case Locale.ENGLISH:
        return {
          ...rest,
          name: name || nameHe || nameAr,
          description: description || descriptionHe || descriptionAr,
          shortDescription:
            shortDescription || shortDescriptionHe || shortDescriptionAr,
          businessId: localizedBusiness,
          image: primaryImage,
          hasDelivery,
        };
      default:
        return item;
    }
  }

  private localizeBusiness(business: any, locale: Locale) {
    const {
      name, nameHe, nameAr, ...rest
    } = business;

    switch (locale) {
      case Locale.ARABIC:
        return {
          ...rest,
          name: nameAr || name || nameHe,
        };
      case Locale.HEBREW:
        return {
          ...rest,
          name: nameHe || name || nameAr,
        };
      case Locale.ENGLISH:
        return {
          ...rest,
          name: name || nameHe || nameAr,
        };
      default:
        return business;
    }
  }
}
