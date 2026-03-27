import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { QueryBus } from '@nestjs/cqrs';
import { GetSiteFiltersConfigByIdentifierIdQuery } from '../queries/get-site-filters-config-by-identifierId.query';
import { GetSiteFiltersConfigByIdentifierIdRequest } from '../requests/get-site-filters-config-by-identifierId.request';

@Controller('')
export class SiteSettingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Site Configs'],
    response: {
      status: HttpStatus.OK,
      description: `Site Filters Config ${ServerSuccess.LISTED}`,
    },
    softBlockExtraDtoFields: true,
    params: [{ name: 'identifierId', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('site-filter-config/:identifierId')
  async getSiteSettingsByIdentifierId(
    @Param('identifierId') identifierId: string,
    @Query() query: GetSiteFiltersConfigByIdentifierIdRequest,
  ) {
    const siteSetting = await this.queryBus.execute(
      new GetSiteFiltersConfigByIdentifierIdQuery(identifierId, query),
    );

    return siteSetting;
  }
}
