// queries/handlers/get-site-setting-partners.handler.ts
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { SiteSetting } from '../../schema/site-settings.schema';
import { GetSiteSettingPartnersQuery } from '../get-site-setting-partners.query';

@QueryHandler(GetSiteSettingPartnersQuery)
export class GetSiteSettingPartnersHandler
implements IQueryHandler<GetSiteSettingPartnersQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteSetting.name)
    private readonly SiteSettingModel: Model<SiteSetting>,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: GetSiteSettingPartnersQuery) {
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId: query.identifierId,
      });

      if (!externalApi) {
        throw new NotFoundException(`External Api ${ServerErrors.NOT_FOUND}`);
      }

      const siteSetting = await this.SiteSettingModel.findOne(
        { externalApiId: externalApi._id, isDeleted: { $ne: true } },
        { partners: 1 }, // project only the partners field
      ).lean();

      if (!siteSetting) {
        throw new NotFoundException(`Site Setting ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SITE_SETTING]: PARTNERS FETCHED', {
        externalApiId: externalApi._id,
      });

      return { partners: siteSetting.partners };
    } catch (err) {
      this.logger.error('[SITE_SETTING]: FAILED TO GET PARTNERS', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
