import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { SiteSetting } from '../../schema/site-settings.schema';
import { GetSiteSettingByExternalApiIdQuery } from '../get-site-setting-by-external-api-id.query';

@QueryHandler(GetSiteSettingByExternalApiIdQuery)
export class GetSiteSettingByExternalApiIdHandler
implements IQueryHandler<GetSiteSettingByExternalApiIdQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteSetting.name)
    private readonly SiteSettingModel: Model<SiteSetting>,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async execute(queries: GetSiteSettingByExternalApiIdQuery) {
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId: queries.identifierId,
      });

      if (!externalApi) {
        throw new NotFoundException(`External Api ${ServerErrors.NOT_FOUND}`);
      }

      const siteSetting = await this.SiteSettingModel.findOne({
        externalApiId: externalApi._id,
        isDeleted: { $ne: true },
      }).lean();

      if (!siteSetting) {
        throw new NotFoundException(`Site Setting ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info(
        '[SITE_SETTING]: SITE SETTING FOUND BY EXTERNAL API ID',
        {
          externalApiId: externalApi._id,
        },
      );

      return {
        ...siteSetting,
        desktopVideos:
          siteSetting.desktopVideos.find(v => v.isActive) ?? null,
        mobileVideos: siteSetting.mobileVideos.find(v => v.isActive) ?? null,
      };
    } catch (err: any) {
      this.logger.error(
        '[SITE_SETTING]: FAILED TO GET SITE SETTING BY EXTERNAL API ID',
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }
}
