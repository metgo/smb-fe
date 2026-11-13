import { Logger } from 'winston';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject } from '@nestjs/common';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ExternalApi } from '../../schema/external-api.schema';
import { GetSiteInfoQuery } from '../get-site-info.query';
import { Theme } from 'src/modules/themes/schema/theme.schema';
import { ServerErrors } from 'src/common/constant';

@QueryHandler(GetSiteInfoQuery)
export class GetSiteInfoHandler implements IQueryHandler<GetSiteInfoQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: GetSiteInfoQuery) {
    const { identifierId } = query;
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId,
      }).populate<{ themeId: Theme }>(
        'themeId',
        'metaTitle metaDescription metaKeywords ogName homeVideos mobileHomeVideos',
      );
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }

      return {
        name: externalApi.name,
        metaTitle: externalApi?.themeId?.metaTitle,
        metaDescription: externalApi?.themeId?.metaDescription,
        metaKeywords: externalApi?.themeId?.metaKeywords,
        siteName: externalApi?.themeId?.ogName,
        siteUrl: externalApi?.themeId?.websiteUrl,
        desktopHomeVideos: externalApi?.themeId?.homeVideos?.filter(
          v => v.isActive,
        ),
        mobileHomeVideos: externalApi?.themeId?.mobileHomeVideos?.filter(
          v => v.isActive,
        ),
      };
    } catch (err) {
      this.logger.error(
        `[EXTERNAL_API]: FAILED TO  GET SITE INFO FOR ${identifierId}`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }
}
