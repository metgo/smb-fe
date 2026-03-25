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
import { GetByCampCodeQueryRequest } from '../request/get-by-campcode.request';
import { GetBusinessDetailForTourismQuery } from '../../tourism/queries/get-business-detail.query';

@Controller()
export class BusinessSharedController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Shared'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.BUSINESS_LISTED,
    },
    operation: 'Get any business detail by slug',
    params: [
      {
        name: 'slug',
        type: 'string',
        required: true,
      },
    ],
  })
  @HttpCode(HttpStatus.OK)
  @Get('businesses/:slug')
  async getBusinessDetailBySlug(
    @Param('slug') slug: string,
    @Query() query: GetByCampCodeQueryRequest,
  ) {
    return await this.queryBus.execute(
      new GetBusinessDetailForTourismQuery(slug, query),
    );
  }
}
