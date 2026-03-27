import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Model } from 'mongoose';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { SiteFiltersConfig } from '../../schema/site-filters-config.schema';
import { GetSiteFiltersConfigByIdentifierIdQuery } from '../get-site-filters-config-by-identifierId.query';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { SiteFiltersConfigStatus } from '../../site-filters-config.type';

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

      const select
        = 'header headerDescription headerHe headerDescriptionHe headerAr headerDescriptionAr siteTopics';
      const siteSettings = await this.SiteFiltersConfigModel.findOne({
        externalApiId: externalApi._id,
        status: SiteFiltersConfigStatus.APPROVED,
      }).select(select);

      if (!siteSettings) {
        throw new NotFoundException(`SITE SETTINGS ${ServerErrors.NOT_FOUND}`);
      }

      console.log(query);

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

      // const { locale } = query;

      // const localizeFields = (
      //   obj: any,
      //   baseField: string,
      //   heField: string,
      //   arField: string,
      // ) => {
      //   let value: string;
      //   if (locale === Locale.ARABIC) {
      //     value = obj[arField] || obj[heField] || obj[baseField];
      //   } else if (locale === Locale.ENGLISH) {
      //     value = obj[baseField] || obj[heField] || obj[arField];
      //   } else {
      //     value = obj[heField] || obj[baseField] || obj[arField];
      //   }

      //   const localized = { ...obj, [baseField]: value };
      //   delete localized[heField];
      //   delete localized[arField];
      //   return localized;
      // };

      // const localizeItem = (item: any) => {
      //   if (!item) return item;
      //   let result = localizeFields(item, 'name', 'nameHe', 'nameAr');
      //   result = localizeFields(
      //     result,
      //     'shortDescription',
      //     'shortDescriptionHe',
      //     'shortDescriptionAr',
      //   );
      //   return result;
      // };

      // const result = siteSettings.toObject();

      // const localizedResult = localizeFields(
      //   result,
      //   'header',
      //   'headerHe',
      //   'headerAr',
      // );

      // const descInput = {
      //   headerDescription: result.headerDescription,
      //   headerDescriptionHe: result.headerDescriptionHe,
      //   headerDescriptionAr: result.headerDescriptionAr,
      // };
      // const localizedDesc = localizeFields(
      //   descInput,
      //   'headerDescription',
      //   'headerDescriptionHe',
      //   'headerDescriptionAr',
      // );
      // localizedResult.headerDescription = localizedDesc.headerDescription;
      // delete localizedResult.headerDescriptionHe;
      // delete localizedResult.headerDescriptionAr;

      // localizedResult.siteTopics = (result.siteTopics || [])
      //   .filter(topic => !topic.isArchived)
      //   .map(topic => {
      //     const localizedTopic = localizeFields(
      //       topic,
      //       'title',
      //       'titleHe',
      //       'titleAr',
      //     );
      //     const withDesc = localizeFields(
      //       localizedTopic,
      //       'description',
      //       'descriptionHe',
      //       'descriptionAr',
      //     );
      //     withDesc.siteCategories = (topic.siteCategories || [])
      //       .filter(cat => !cat.isArchived)
      //       .map(cat => {
      //         const localizedCat = localizeFields(
      //           cat,
      //           'title',
      //           'titleHe',
      //           'titleAr',
      //         );
      //         const localizedCatFull = localizeFields(
      //           localizedCat,
      //           'description',
      //           'descriptionHe',
      //           'descriptionAr',
      //         );
      //         localizedCatFull.businessIds = (cat.businessIds || []).map(
      //           localizeItem,
      //         );
      //         localizedCatFull.eventIds = (cat.eventIds || []).map(
      //           localizeItem,
      //         );
      //         localizedCatFull.poiIds = (cat.poiIds || []).map(localizeItem);
      //         localizedCatFull.tripIds = (cat.tripIds || []).map(localizeItem);
      //         localizedCatFull.productIds = (cat.productIds || []).map(
      //           localizeItem,
      //         );
      //         localizedCatFull.fundayIds = (cat.fundayIds || []).map(
      //           localizeItem,
      //         );
      //         return localizedCatFull;
      //       });
      //     return withDesc;
      //   });

      // return localizedResult;
      return siteSettings;
    } catch (error) {
      this.logger.error('[SITE SETTINGS]: FAILED TO GET SITE SETTINGS', {
        err: error.message,
      });
      exceptionHandling(error);
    }
  }
}
