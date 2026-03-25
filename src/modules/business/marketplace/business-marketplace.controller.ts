/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import {
  Controller, Get, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetAllBusinessesForMapRequest } from 'src/modules/business/shared/request';
import { GetAllBusinessForMapQuery } from 'src/modules/business/marketplace/queries/get-all-business-for-map.query';

@Controller()
export class BusinessMarketplaceController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['MarketPlace-Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all businesses for map by non-authenticated users',
  })
  @Get('map-businesses')
  @HttpCode(HttpStatus.OK)
  async getAllBusinessForMap(@Query() query?: GetAllBusinessesForMapRequest) {
    const businesses = await this.queryBus.execute(
      new GetAllBusinessForMapQuery(query),
    );

    return businesses;
  }
}
