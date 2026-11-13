/* eslint-disable no-undef */
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

import { GetMarketingByIdQuery } from '../queries/get-marketing-by-id.query';
import { ExternalApiPostQuery } from 'src/common/query-handler/external-api.query';
import { GetAllMarketingQuery } from '../queries/get-all-marketing.query';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Tourism-Marketing'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('')
  async getAllEvents(@Query() query: ExternalApiPostQuery) {
    return await this.queryBus.execute(new GetAllMarketingQuery(query));
  }

  @ApiEndpoint({
    tags: ['Tourism-Marketing'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getMarketingById(
    @Param('id') id: string,
    @Query() query: ExternalApiPostQuery,
  ) {
    return this.queryBus.execute(new GetMarketingByIdQuery(id, query));
  }
}
