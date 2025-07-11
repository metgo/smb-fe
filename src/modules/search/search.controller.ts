import {
  Controller, Get, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetCombinedSearchQuery } from './query/get-combined-search.query';
import { GetSearchRequest } from './request/get-search-request';

@Controller('tourism-search')
export class SearchController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Tourism-Business', 'Tourism-Events'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.SEARCH,
    },
    operation: 'Get search data for business and events',
  })
  @HttpCode(HttpStatus.OK)
  @Get('')
  async getCombinedSearch(@Query() query: GetSearchRequest) {
    const result = await this.queryBus.execute(
      new GetCombinedSearchQuery(query),
    );
    return result;
  }
}
