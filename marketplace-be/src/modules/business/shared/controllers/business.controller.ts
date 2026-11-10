/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { CreateBusinessRequest } from '../request/create-business.request';
import { GetBusinessDetailForTourismQuery } from '../../tourism/queries/get-business-detail.query';
import { CreateBusinessCommand } from '../../command/create-business.command';
import { GetBusinessDetailTourismRequest } from '../../tourism/request/get-business-detail-tourism.request';

@Controller()
export class BusinessSharedController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiEndpoint({
    tags: ['Shared'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.BUSINESS_CREATED,
    },
    operation: 'Create a new business f',
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('businesses')
  async createBusiness(@Body() body: CreateBusinessRequest) {
    return await this.commandBus.execute(new CreateBusinessCommand(body));
  }

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
    @Query() query: GetBusinessDetailTourismRequest,
  ) {
    return await this.queryBus.execute(
      new GetBusinessDetailForTourismQuery(slug, query),
    );
  }
}
