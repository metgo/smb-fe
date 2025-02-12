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
  Req,
  UseGuards,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { JwtExternalApiAuthGuard } from 'src/core/guards/jwt/jwt-externalapi.guards';
import { GetAllUnpaginatedBusinessQuery } from 'src/modules/business/queries';
import { GetAllBusinessQuery } from 'src/modules/business/queries/get-all-business.query';
import { BusinessService } from 'src/modules/business/services/business.service';

@Controller()
export class BusinessController {
  constructor(private readonly businessServices: BusinessService) {}

  @UseGuards(JwtExternalApiAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get all businesses',
  })
  @HttpCode(HttpStatus.OK)
  @Get('businesses')
  async getAllBusiness(@Req() request, @Query() query?: GetAllBusinessQuery) {
    const businesses = await this.businessServices.getAllBusiness(
      request.user,
      query,
    );

    return businesses;
  }

  @UseGuards(JwtExternalApiAuthGuard)
  @ApiEndpoint({
    tags: ['Business'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    noAuthToken: true,
    operation: 'Get any business detail',
  })
  @HttpCode(HttpStatus.OK)
  @Get('businesses/:id')
  async getBusinessDetailForAdmin(@Req() request, @Param('id') id: string) {
    const business = await this.businessServices.getBusiness({
      id,
      loggedInUser: request.user,
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
