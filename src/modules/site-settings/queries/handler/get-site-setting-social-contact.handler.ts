// queries/handlers/get-site-setting-social-contact.handler.ts
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
import { GetSiteSettingSocialContactQuery } from '../get-site-setting-social-contact.query';

const SOCIAL_CONTACT_FIELDS = {
  // Social
  facebookUrl: 1,
  instagramUrl: 1,
  twitterUrl: 1,
  youtubeUrl: 1,
  linkedinUrl: 1,
  tiktokUrl: 1,
  showSocialIcons: 1,
  socialLinksNewTab: 1,
  // Contact
  phoneNumber: 1,
  whatsappNumber: 1,
  email: 1,
  supportEmail: 1,
  physicalAddress: 1,
  googleMapsEmbed: 1,
  enableClickToCall: 1,
  enableWhatsappChat: 1,
  externalApiId: 1,
} as const;

@QueryHandler(GetSiteSettingSocialContactQuery)
export class GetSiteSettingSocialContactHandler
implements IQueryHandler<GetSiteSettingSocialContactQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(SiteSetting.name)
    private readonly SiteSettingModel: Model<SiteSetting>,
    @InjectModel(ExternalApi.name)
    private readonly ExternalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: GetSiteSettingSocialContactQuery) {
    try {
      const externalApi = await this.ExternalApiModel.findOne({
        identifierId: query.identifierId,
      });

      if (!externalApi) {
        throw new NotFoundException(`External Api ${ServerErrors.NOT_FOUND}`);
      }

      const siteSetting = await this.SiteSettingModel.findOne(
        { externalApiId: externalApi._id, isDeleted: { $ne: true } },
        SOCIAL_CONTACT_FIELDS,
      ).lean();

      if (!siteSetting) {
        throw new NotFoundException(`Site Setting ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SITE_SETTING]: SOCIAL & CONTACT FETCHED', {
        externalApiId: externalApi._id,
      });

      const { _id, ...data } = siteSetting as any;
      return data;
    } catch (err) {
      this.logger.error('[SITE_SETTING]: FAILED TO GET SOCIAL & CONTACT', {
        err: err.message,
      });
      exceptionHandling(err);
    }
  }
}
