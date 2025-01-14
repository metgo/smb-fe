import {
  Controller, Get, HttpStatus, Param, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { Locale } from 'src/common/enum';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { GroupTypeService } from './group-type.service';

@Controller()
export class GroupTypeController {
  constructor(private readonly groupTypeService: GroupTypeService) {}

  @ApiEndpoint({
    tags: ['Admin', 'Group Type'],
    response: {
      status: 200,
      description: ServerSuccess.GROUP_TYPE.LISTED,
    },
  })
  @Get('admin/group-type')
  async getAll(@Res() response: Response, @Query() query: LocaleFilterQuery) {
    const groupType = await this.groupTypeService.getAll(query);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.GROUP_TYPE.LISTED,
      groupType,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Admin', 'Group Type'],
    response: {
      status: 200,
      description: ServerSuccess.GROUP_TYPE.LISTED,
    },
  })
  @Get('admin/group-type/:id')
  async getOne(
    @Res() response: Response,
    @Param('id') id: string,
    @Query('locale') locale: Locale,
  ) {
    const groupType = await this.groupTypeService.getOne(id, locale);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.GROUP_TYPE.LISTED,
      groupType,
      null,
      null,
    );
  }
}
