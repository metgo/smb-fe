import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { Locale } from 'src/common/enum';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GroupTypeService } from './group-type.service';

@Controller()
export class GroupTypeController {
  constructor(private readonly groupTypeService: GroupTypeService) {}

  @ApiEndpoint({
    tags: ['Group Type'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.GROUP_TYPE.LISTED,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('group-types')
  async getAll(@Query() query: LocaleFilterQuery) {
    const groupTypes = await this.groupTypeService.getAll(query);
    return groupTypes;
  }

  @ApiEndpoint({
    tags: ['Group Type'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.GROUP_TYPE.LISTED,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('group-types/:id')
  async getOne(@Param('id') id: string, @Query('locale') locale: Locale) {
    const groupType = await this.groupTypeService.getOne(id, locale);
    return groupType;
  }
}
