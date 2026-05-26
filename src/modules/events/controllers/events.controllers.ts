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
import { GetByCampCodeQueryRequest } from 'src/common/request/get-by-camp-code.request';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';

import { GetAllEventsRequest } from '../requests/get-all-events.request';
import { GetAllEventsQuery } from '../queries/get-all-events.query';
import { GetEventBySlugQuery } from '../queries/get-event-by-slug.query';
import { GetSearchRecommendationQuery } from '../queries/get-search-recommendation.query';
import { GetAllEventsBusinessIdRequest } from '../requests/get-all-events-businessId.request';
import { GetAllEventsByBusinessIdQuery } from '../queries/get-all-events-by-businessId.query';

@Controller('events')
export class EventController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Tourism-Events'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EVENTS.LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all events',
  })
  @HttpCode(HttpStatus.OK)
  @Get('')
  async getAllEvents(@Query() query?: GetAllEventsRequest) {
    return await this.queryBus.execute(new GetAllEventsQuery(query));
  }

  @ApiEndpoint({
    tags: ['Tourism-Events'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EVENTS.LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all events with businessId',
  })
  @HttpCode(HttpStatus.OK)
  @Get('events-by-businessId')
  async getAllEventsByBusinessId(
    @Query() query?: GetAllEventsBusinessIdRequest,
  ) {
    return await this.queryBus.execute(
      new GetAllEventsByBusinessIdQuery(query),
    );
  }

  @ApiEndpoint({
    tags: ['Tourism-Events'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    operation: 'Get search recommendation for events',
  })
  @HttpCode(HttpStatus.OK)
  @Get('search-recommendation')
  async getSearchRecommendationForEvents(
    @Query() query: GetByCampCodeQueryRequest,
  ) {
    return await this.queryBus.execute(new GetSearchRecommendationQuery(query));
  }

  @ApiEndpoint({
    tags: ['Tourism-Events'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EVENTS.LISTED,
    },
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
      },
    ],
    softBlockExtraDtoFields: true,
    operation: 'Get event detail',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':slug')
  async getEventsBySlug(
    @Param('slug') slug: string,
    @Query() query: GetByCampCodeQueryRequest,
  ) {
    return await this.queryBus.execute(new GetEventBySlugQuery(slug, query));
  }
}
