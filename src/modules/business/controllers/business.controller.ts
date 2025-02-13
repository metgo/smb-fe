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

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetAllUnpaginatedBusinessQuery } from 'src/modules/business/queries';
import { BusinessService } from 'src/modules/business/services/business.service';

@Controller()
export class BusinessController {
  constructor(private readonly businessServices: BusinessService) {}

  @ApiEndpoint({
    tags: ['Business'],
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
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all businesses for map by non-authenticated users',
  })
  @Get('map-businesses')
  @HttpCode(HttpStatus.OK)
  async getAllBusinessForMap(@Query() query?: GetAllUnpaginatedBusinessQuery) {
    const businesses = await this.businessServices.getAllBusinessesForMap(
      query,
    );

    return businesses;
  }
}
