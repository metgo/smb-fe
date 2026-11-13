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
import { Locale } from 'src/common/enum';
import { GetSettingByIdentifierIdQuery } from 'src/modules/settings/queries/get-setting-by-identifier-id.query';
import { SettingType } from 'src/modules/settings/settings.type';

@Controller('settings')
export class SettingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Settings'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.SETTINGS.LISTED,
    },
    params: [{ name: 'identifierId', type: 'string', required: true }],
    operation: 'Get Settings By Identifier ID',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':identifierId')
  async getSettingsByIdentifierId(
    @Param('identifierId') identifierId: string,
    @Query('locale') locale?: Locale,
    @Query('type') type?: SettingType,
  ) {
    const settings = await this.queryBus.execute(
      new GetSettingByIdentifierIdQuery(identifierId, locale, type),
    );

    return settings;
  }
}
