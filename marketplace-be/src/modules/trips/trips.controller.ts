import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetAllTripsRequest } from './request/get-all-trips.request';
import { GetAllTripsQuery } from './queries/get-all-trips.query';
import { GetTripBySlugQuery } from './queries/get-trip-by-slug.query';
import { GetTripsBySlugRequest } from './request/get-trips-by-slug.request';
import { GetTripsByBusinessIdRequest } from './request/get-trips-by-business-id.request';
import { GetTripsByBusinessIdQuery } from './queries/get-trips-by-business-id.query';

@Controller()
export class TripController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Tourism-Trips'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all trips',
  })
  @HttpCode(HttpStatus.OK)
  @Get('trips')
  async getAllTrips(@Query() query?: GetAllTripsRequest) {
    return this.queryBus.execute(new GetAllTripsQuery(query));
  }

  @ApiEndpoint({
    tags: ['Tourism-Trips'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    params: [
      {
        name: 'businessId',
        type: 'string',
        required: true,
      },
    ],
    softBlockExtraDtoFields: true,
    operation: 'Get all trips by businessId',
  })
  @HttpCode(HttpStatus.OK)
  @Get('trips/by-business/:businessId')
  async getTripsByBusinessId(
    @Param('businessId') businessId: string,
    @Query() query?: GetTripsByBusinessIdRequest,
  ) {
    return this.queryBus.execute(
      new GetTripsByBusinessIdQuery(businessId, query),
    );
  }

  @ApiEndpoint({
    tags: ['Tourism-Trips'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
      },
    ],
    softBlockExtraDtoFields: true,
    operation: 'Get trips by slug',
  })
  @HttpCode(HttpStatus.OK)
  @Get('trips/:slug')
  async getTrip(
    @Param('slug') slug: string,
    @Query() query: GetTripsBySlugRequest,
  ) {
    return this.queryBus.execute(new GetTripBySlugQuery(slug, query));
  }
}
