import {
  Controller, Get, HttpCode, HttpStatus, Param,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetSiteSettingByExternalApiIdQuery } from './queries/get-site-setting-by-external-api-id.query';

@Controller('site-theme')
export class SiteSettingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Site Settings'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
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
}
