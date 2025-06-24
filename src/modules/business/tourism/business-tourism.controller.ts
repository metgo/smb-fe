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
import { GetAllApprovedBusinessesQuery } from 'src/modules/business/tourism/queries/get-all-approved-businesses.query';
import { GetAllApprovedBusinessesRequest } from 'src/modules/business/tourism/request/get-all-approved-businesses.request';
import { GetAllBusinessForMapTourismQuery } from './queries/get-all-businesses-for-map.query';
import { GetBusinessDetailForMapTourismQuery } from './queries/get-business-detail.query';
import { GetByCampCodeQueryRequest } from '../shared/request/get-by-campcode.request';

@Controller('tourism')
export class BusinessTourismController {
  constructor(private readonly queryBus: QueryBus) {}

  // @ApiEndpoint({
  //   tags: ['Tourism'],
  //   response: {
  //     status: HttpStatus.OK,
  //     description: ServerSuccess.BUSINESS_LISTED,
  //   },
  //   operation: 'Get any business detail',
  //   params: [
  //     {
  //       name: 'businessId',
  //       type: 'string',
  //       required: true,
  //     },
  //   ],
  // })
  // @HttpCode(HttpStatus.OK)
  // @Get('businesses/:businessId')
  // async getBusinessDetailForAdmin(@Param('businessId') businessId: string) {
  //   const business = await this.businessServices.getBusiness({
  //     id: businessId,
  //   });

  //   return business;
  // }

  @ApiEndpoint({
    tags: ['Tourism'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all approved business',
  })
  @HttpCode(HttpStatus.OK)
  @Get('businesses')
  async getAllBusiness(@Query() query?: GetAllApprovedBusinessesRequest) {
    const businesses = await this.queryBus.execute(
      new GetAllApprovedBusinessesQuery(query),
    );

    return businesses;
  }

  @ApiEndpoint({
    tags: ['Tourism'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    softBlockExtraDtoFields: true,
    operation: 'Get all businesses for map',
  })
  @Get('map-businesses')
  @HttpCode(HttpStatus.OK)
  async getAllBusinessForMap(@Query() query?: GetAllBusinessesForMapRequest) {
    const businesses = await this.queryBus.execute(
      new GetAllBusinessForMapTourismQuery(query),
    );

    return businesses;
  }

  @ApiEndpoint({
    tags: ['Tourism'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    operation: 'Get any business detail for map',
    params: [
      {
        name: 'businessId',
        type: 'string',
        required: true,
      },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get('map-businesses/:businessId')
  async getBusinessDetailForMap(
    @Param('businessId') businessId: string,
    @Query() query: GetByCampCodeQueryRequest,
  ) {
    return await this.queryBus.execute(
      new GetBusinessDetailForMapTourismQuery(businessId, query),
    );
  }
}
