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
import { GetAllPOIsRequest } from './request/get-all-pois.request';
import { GetPOIDetailRequest } from './request/get-poi-detail.request';
import { GetAllPOIsQuery } from './queries/get-all-pois.query';
import { GetPOIDetailQuery } from './queries/get-poi-detail.query';

@Controller('')
export class PointOfInterestsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Point of Interests'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
    operation:
      'Get all approved point of interests by campCode or identifierId',
  })
  @HttpCode(HttpStatus.OK)
  @Get('point-of-interests')
  async getAllPOIs(@Query() query: GetAllPOIsRequest) {
    return this.queryBus.execute(new GetAllPOIsQuery(query));
  }

  @ApiEndpoint({
    tags: ['Point of Interests'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get point of interest detail by slug',
    params: [{ name: 'slug', type: 'string', required: true }],
  })
  @HttpCode(HttpStatus.OK)
  @Get('point-of-interests/:slug')
  async getPOIDetail(
    @Param('slug') slug: string,
    @Query() query: GetPOIDetailRequest,
  ) {
    return this.queryBus.execute(new GetPOIDetailQuery(slug, query));
  }
}
