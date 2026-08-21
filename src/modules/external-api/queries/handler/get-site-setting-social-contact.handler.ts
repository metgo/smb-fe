import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ServerErrors } from 'src/common/constant';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { GetSiteSettingSocialContactQuery } from '../get-site-setting-social-contact.query';
import { ExternalApi } from '../../schema/external-api.schema';

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
  whatsappMessageEn: 1,
  whatsappMessageHe: 1,
  whatsappMessageAr: 1,
  email: 1,
  supportEmail: 1,
  physicalAddress: 1,
  googleMapsEmbed: 1,
  enableClickToCall: 1,
  enableWhatsappChat: 1,
} as const;

const LOCALE_SUFFIX_MAP: Record<string, string> = {
  en: 'En',
  he: 'He',
  ar: 'Ar',
};

@QueryHandler(GetSiteSettingSocialContactQuery)
export class GetSiteSettingSocialContactHandler
implements IQueryHandler<GetSiteSettingSocialContactQuery> {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    @InjectModel(ExternalApi.name)
    private readonly externalApiModel: Model<ExternalApi>,
  ) {}

  async execute(query: GetSiteSettingSocialContactQuery) {
    try {
      const siteSetting = await this.externalApiModel
        .findOne(
          {
            identifierId: query.identifierId,
            isDeleted: { $ne: true },
          },
          SOCIAL_CONTACT_FIELDS,
        )
        .lean();

      if (!siteSetting) {
        throw new NotFoundException(`Site Setting ${ServerErrors.NOT_FOUND}`);
      }

      this.logger.info('[SITE_SETTING]: SOCIAL & CONTACT FETCHED', {
        websiteId: siteSetting._id,
      });

      const suffix = LOCALE_SUFFIX_MAP[query.locale] || 'En';

      const {
        whatsappMessageEn,
        whatsappMessageHe,
        whatsappMessageAr,
        ...rest
      } = siteSetting;

      return {
        ...rest,
        whatsappMessage:
          siteSetting[`whatsappMessage${suffix}`] || whatsappMessageEn || '',
      };
    } catch (err: any) {
      this.logger.error('[SITE_SETTING]: FAILED TO GET SOCIAL & CONTACT', {
        err: err.message,
      });

      exceptionHandling(err);
    }
  }
}
