import {
  Controller, Get, HttpCode, HttpStatus, Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetSiteSettingByExternalApiIdQuery } from './queries/get-site-setting-by-external-api-id.query';
import { GetSiteSettingPartnersQuery } from './queries/get-site-setting-partners.query';
import { GetSiteSettingSeoQuery } from './queries/get-site-setting-seo.query';
import { GetSiteSettingSocialContactQuery } from './queries/get-site-setting-social-contact.query';
import { GetSiteSettingIdentityThemeQuery } from './queries/get-site-setting-identity-theme.query';

@Controller('site-theme')
export class SiteSettingsController {
  constructor(private readonly queryBus: QueryBus) {}

  // ── existing endpoint: full site setting by external api id ───────────────────────────────
  @ApiEndpoint({
    tags: ['Site Settings'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Get site setting by external api id',
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get(':identifierId')
  async getSiteSettingByExternalApiId(
    @Param('identifierId') identifierId: string,
  ) {
    return this.queryBus.execute(
      new GetSiteSettingByExternalApiIdQuery(identifierId),
    );
  }

  // ── new: partners only ─────────────────────────────────────────────────
  @ApiEndpoint({
    tags: ['Site Settings'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Get partners by external api id',
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('partners/:identifierId')
  async getSiteSettingPartners(@Param('identifierId') identifierId: string) {
    return this.queryBus.execute(new GetSiteSettingPartnersQuery(identifierId));
  }

  // ── new: SEO only ──────────────────────────────────────────────────────
  @ApiEndpoint({
    tags: ['Site Settings'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Get SEO and analytics by external api id',
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('seo/:identifierId')
  async getSiteSettingSeo(@Param('identifierId') identifierId: string) {
    return this.queryBus.execute(new GetSiteSettingSeoQuery(identifierId));
  }

  // ── new: social and contact only ──────────────────────────────────────────────────────

  @ApiEndpoint({
    tags: ['Site Settings'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Get social and contact by external api id',
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('social-contact/:identifierId')
  async getSiteSettingSocialContact(
    @Param('identifierId') identifierId: string,
  ) {
    return this.queryBus.execute(
      new GetSiteSettingSocialContactQuery(identifierId),
    );
  }

  // ── new: theme,brand, media and localization only ──────────────────────────────────────────────────────

  @ApiEndpoint({
    tags: ['Site Settings'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Get identity and theme by external api id',
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('identity-theme/:identifierId')
  async getSiteSettingIdentityTheme(
    @Param('identifierId') identifierId: string,
  ) {
    return this.queryBus.execute(
      new GetSiteSettingIdentityThemeQuery(identifierId),
    );
  }
}
