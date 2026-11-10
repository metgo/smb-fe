import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetCombinedSearchQuery } from './query/get-combined-search.query';
import { GetSearchRequest } from './request/get-search-request';
import { NotifyNoResultCommand } from './command/notify-no-result.command';
import { ReportNoResultRequest } from './request/report-no-result.request';

@Controller('')
export class SearchController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiEndpoint({
    tags: ['Tourism-Business', 'Tourism-Events'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.SEARCH,
    },
    operation: 'Get search data for business and events',
  })
  @HttpCode(HttpStatus.OK)
  @Get('tourism-search')
  async getCombinedSearch(@Query() query: GetSearchRequest) {
    const result = await this.queryBus.execute(
      new GetCombinedSearchQuery(query),
    );
    return result;
  }

  @ApiEndpoint({
    tags: ['Shared'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EMAIL.SENT,
    },
    operation: 'Report a search keyword that returned no results',
  })
  @HttpCode(HttpStatus.OK)
  @Post('search/no-result-notification')
  async reportNoResult(@Body() body: ReportNoResultRequest) {
    await this.commandBus.execute(
      new NotifyNoResultCommand(body.keyword, body.websiteUrl),
    );
    return { message: ServerSuccess.EMAIL.SENT };
  }
}
