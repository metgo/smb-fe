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
import { Locale } from 'src/common/enum';
import { LocaleFilterQuery } from 'src/common/query-handler/locale-filter.query';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GroupTypeService } from './group-type.service';
import { GetAllGroupTypesRequest } from './request/get-all-grouptype.request';
import { GetAllGroupTypesQuery } from './queries/get-all-grouptypes.query';

@Controller()
export class GroupTypeController {
  constructor(
    private readonly groupTypeService: GroupTypeService,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiEndpoint({
    tags: ['Tourism-GroupType'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.GROUP_TYPE.LISTED,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Get('tourism/group-types')
  async getAllGroupTypesForTourism(@Query() query: GetAllGroupTypesRequest) {
    const groupTypes = await this.queryBus.execute(
      new GetAllGroupTypesQuery(query),
    );
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
  @Get('group-types')
  async getAllGroupTypes(@Query() query: LocaleFilterQuery) {
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
  async getOneGroupType(
    @Param('id') id: string,
    @Query('locale') locale: Locale,
  ) {
    const groupType = await this.groupTypeService.getOne(id, locale);
    return groupType;
  }
}
