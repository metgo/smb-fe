// dashboard/dashboard.controller.ts
import {
  Controller, Get, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiQuery } from '@nestjs/swagger';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetAllFeedItemsRequest } from './request/get-all-feed-items.request';
import { GetAllFeedItemsQuery } from './queries/get-all-feed-items.query';
import { GetDefaultFiltersQuery } from './queries/get-default-filters.query';
import { GetFiltersQuery } from './queries/get-filters.query';
import { GetAllFiltersRequest } from './request/get-all-filters.request';

@Controller('')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @HttpCode(HttpStatus.OK)
  @Get('feed')
  @ApiEndpoint({
    tags: ['Tourism-Feed'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all approved business',
  })
  async getAllFeedItems(@Query() request: GetAllFeedItemsRequest) {
    return this.queryBus.execute(
      new GetAllFeedItemsQuery(
        request.campCode,
        request.groupTypesId,
        request.accessibilitiesId,
        request.categoriesId,
        request.subCategoriesId,
        request.sortBy,
        request.sortOrder,
        request.serviceType,
        request.search,
        request.page,
        request.limit,
      ),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('default-filters')
  @ApiEndpoint({
    tags: ['Tourism-Feed'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get default filter items of website',
  })
  @ApiQuery({
    name: 'identifierId',
    required: true,
    type: String,
    description: 'Identifier ID used to filter items',
  })
  async getDefaultFilterItems(@Query('identifierId') identifierId: string) {
    return this.queryBus.execute(new GetDefaultFiltersQuery(identifierId));
  }

  @HttpCode(HttpStatus.OK)
  @Get('filters')
  @ApiEndpoint({
    tags: ['Tourism-Feed'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all filter items',
  })
  async getFilterItems(@Query() query: GetAllFiltersRequest) {
    return this.queryBus.execute(new GetFiltersQuery(query));
  }
}
