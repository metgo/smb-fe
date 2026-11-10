import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetSiteInfoQuery } from './queries/get-site-info.query';
import { GetPromotionalItemsQuery } from './queries/get-promotional-items.query';
import { GetPromotionalItemsRequest } from './request/get-promotional-items.request';
import { GetSiteSettingSocialContactQuery } from './queries/get-site-setting-social-contact.query';
import { GetSiteSettingIdentityThemeQuery } from './queries/get-site-setting-identity-theme.query';
import { GetSiteSettingSeoQuery } from './queries/get-site-setting-seo.query';

@Controller('')
export class ExternalApiController {
  constructor(private readonly queryBus: QueryBus) {}

  // ── new: SEO only ──────────────────────────────────────────────────────
  @ApiEndpoint({
    tags: ['Site Settings'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Get SEO and analytics by external api id',
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('site-theme/seo/:identifierId')
  async getSiteSettingSeo(
    @Param('identifierId') identifierId: string,
    @Query('locale') locale: string = 'en',
  ) {
    return this.queryBus.execute(
      new GetSiteSettingSeoQuery(identifierId, locale),
    );
  }

  // ── new: social and contact only ──────────────────────────────────────────────────────
  @ApiEndpoint({
    tags: ['Site Settings'],
    response: { status: HttpStatus.OK, description: ServerSuccess.LISTED },
    operation: 'Get social and contact by external api id',
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('site-theme/social-contact/:identifierId')
  async getSiteSettingSocialContact(
    @Param('identifierId') identifierId: string,
    @Query('locale') locale: string = 'en',
  ) {
    return this.queryBus.execute(
      new GetSiteSettingSocialContactQuery(identifierId, locale),
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
  @Get('site-theme/identity-theme/:identifierId')
  async getSiteSettingIdentityTheme(
    @Param('identifierId') identifierId: string,
    @Query('locale') locale: string = 'en',
  ) {
    return this.queryBus.execute(
      new GetSiteSettingIdentityThemeQuery(identifierId, locale),
    );
  }

  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EXTERNAL_API.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('external-api/site-info/:identifierId')
  async getSiteInfo(@Param('identifierId') identifierId: string) {
    return await this.queryBus.execute(new GetSiteInfoQuery(identifierId));
  }

  @ApiEndpoint({
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EXTERNAL_API.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('external-api/promotional-items/:identifierId')
  async getPromotionalItems(
    @Param('identifierId') identifierId: string,
    @Query() query: GetPromotionalItemsRequest,
  ) {
    return await this.queryBus.execute(
      new GetPromotionalItemsQuery(identifierId, query),
    );
  }
}
