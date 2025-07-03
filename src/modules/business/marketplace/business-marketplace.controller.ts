/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
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
import { GetAllBusinessesForMapRequest } from 'src/modules/business/shared/request';
import { GetAllBusinessForMapQuery } from 'src/modules/business/marketplace/queries/get-all-business-for-map.query';
import { BusinessService } from 'src/modules/business/shared/services/business.service';

@Controller()
export class BusinessMarketplaceController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly businessServices: BusinessService,
  ) {}

  @ApiEndpoint({
    tags: ['MarketPlace-Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    operation: 'Get any business detail',
    params: [
      {
        name: 'businessId',
        type: 'string',
        required: true,
      },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get('businesses/:businessId')
  async getBusinessDetailForAdmin(@Param('businessId') businessId: string) {
    const business = await this.businessServices.getBusiness({
      id: businessId,
    });

    return business;
  }

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
