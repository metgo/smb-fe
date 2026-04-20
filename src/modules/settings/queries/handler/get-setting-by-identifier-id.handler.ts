import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ServerErrors } from 'src/common/constant';
import { CommonStatus, Locale } from 'src/common/enum';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { ExternalApi } from 'src/modules/external-api/schema/external-api.schema';
import { Setting } from '../../schema/settings.schema';
import { GetSettingByIdentifierIdQuery } from '../get-setting-by-identifier-id.query';

@QueryHandler(GetSettingByIdentifierIdQuery)
export class GetSettingByIdentifierIdHandler
implements IQueryHandler<GetSettingByIdentifierIdQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
    @InjectModel(Setting.name)
    private readonly SettingModel: Model<Setting>,
  ) {}

  async execute(query: GetSettingByIdentifierIdQuery) {
    const { identifierId, locale, type } = query;
    try {
      const externalApi = await this.ExternalApiModel.findOne({ identifierId });
      if (!externalApi) {
        throw new ForbiddenException(ServerErrors.EXTERNAL_API.IDENTIFIER_ID);
      }

      const filter: Record<string, unknown> = {
        externalApiId: externalApi._id,
        status: CommonStatus.APPROVED,
        isDeleted: { $ne: true },
      };

      if (type) {
        filter.type = type;
      }

      const settings = await this.SettingModel.findOne(filter);

      if (!settings) {
        throw new NotFoundException(`Settings ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SETTING]: SETTINGS FOUND BY IDENTIFIER ID', {
        identifierId,
        type,
      });

      if (!settings) {
        return settings;
      }

      const doc = settings.toObject();

      let { title, subTitle, description } = doc;

      if (locale === Locale.HEBREW) {
        title = doc.titleHe || doc.title || doc.titleAr;
        subTitle = doc.subTitleHe || doc.subTitle || doc.subTitleAr;
        description = doc.descriptionHe || doc.description || doc.descriptionAr;
      } else if (locale === Locale.ARABIC) {
        title = doc.titleAr || doc.title || doc.titleHe;
        subTitle = doc.subTitleAr || doc.subTitle || doc.subTitleHe;
        description = doc.descriptionAr || doc.description || doc.descriptionHe;
      }

      return {
        title,
        subTitle,
        description,
        type: doc.type,
        status: doc.status,
        slug: doc.slug,
        docUrl: doc.docUrl,
        docType: doc.docType,
        docSize: doc.docSize,
      };
    } catch (err) {
      this.logger.error('[SETTING]: FAILED TO GET SETTINGS BY IDENTIFIER ID', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
