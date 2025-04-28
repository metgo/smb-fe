/* eslint-disable no-undef */
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';

import { exceptionHandling } from 'src/common/utils/exception-handling';
import { disSelect } from 'src/common/utils/select.handling';
import { findOneByFieldName } from 'src/core/helper/query-helper';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { Theme } from '../themes/schema/theme.schema';

@Injectable()
export class ExternalApiServices {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async getById(id: string) {
    const select = `${disSelect}`;

    const externalApiDetail = await this.ExternalApiModel.findById(id)
      .select(select)
      .exec();

    return externalApiDetail;
  }

  async findByFieldName(fieldName: keyof ExternalApi, items: string) {
    try {
      const externalApi = await findOneByFieldName<ExternalApi>(
        this.ExternalApiModel,
        fieldName,
        items,
      );
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.FORBIDDEN);
      }
      return externalApi;
    } catch (err) {
      this.logger.error('[EXTERNAL_API]: FAILED TO GET EXTERNAL API', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async findByIdentifierId(identifierId: string) {
    try {
      const populate = {
        path: 'themeId',
        select:
          'primaryColor secondaryColor faceBookUrl instagramUrl twitterUrl threadsUrl websiteUrl youtubeUrl whatsappNo',
      };
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId,
      }).populate(populate);
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }
      return externalApi;
    } catch (err) {
      this.logger.error(
        `[EXTERNAL_API-${identifierId}]: FAILED TO GET EXTERNAL API'`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async findByIdAndPopulateTheme(id: string) {
    try {
      const populate = {
        path: 'themeId',
        select:
          'primaryColor secondaryColor faceBookUrl instagramUrl twitterUrl threadsUrl websiteUrl youtubeUrl whatsappNo',
      };
      const externalApi = await this.ExternalApiModel.findOne({
        _id: id,
      }).populate(populate);
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }
      return externalApi;
    } catch (err) {
      this.logger.error(`[EXTERNAL_API-${id}]: FAILED TO GET EXTERNAL API'`, {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }

  async findByIdentifierIdAndPopulateTheme(identifierId: string) {
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId,
      }).populate<{ themeId: Theme }>(
        'themeId',
        'homeHeader homeDescription faceBookUrl instagramUrl twitterUrl threadsUrl websiteUrl youtubeUrl whatsappNo primaryColor secondaryColor metaTitle metaDescription metaKeywords ogName',
      );
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }

      return {
        name: externalApi.name,
        url: {
          facebook: externalApi?.themeId?.faceBookUrl,
          instagram: externalApi?.themeId?.instagramUrl,
          twitter: externalApi?.themeId?.twitterUrl,
          threads: externalApi?.themeId?.threadsUrl,
          website: externalApi?.themeId?.websiteUrl,
          youtube: externalApi?.themeId?.youtubeUrl,
          whatsappNo: externalApi?.themeId?.whatsappNo,
        },
        homeHeader: externalApi?.themeId?.homeHeader,
        homeDescription: externalApi?.themeId?.homeDescription,
        email: externalApi?.companyDetails?.email,
        welcomeBanner: externalApi?.welcomeBanner,
      };
    } catch (err) {
      this.logger.error(
        `[EXTERNAL_API-${identifierId}]: FAILED TO GET EXTERNAL API'`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }

  async getSiteInfoByIdentifierId(identifierId: string) {
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId,
      }).populate<{ themeId: Theme }>(
        'themeId',
        'metaTitle metaDescription metaKeywords ogName',
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
      };
    } catch (err) {
      this.logger.error(
        `[EXTERNAL_API-${identifierId}]: FAILED TO GET EXTERNAL API's SITE INFO'`,
        {
          err: err.message,
        },
      );
      exceptionHandling(err);
    }
  }
}
