import {
  Controller, Get, HttpCode, HttpStatus, Param, Query,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { GetTicketByIdQuery } from '../queries/get-ticket-by-id.query';

@Controller('tickets')
export class TicketController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    tags: ['Tourism-Tickets'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.LISTED,
    },
    params: [
      {
        name: 'id',
        type: 'string',
        required: true,
      },
    ],
    softBlockExtraDtoFields: true,
    operation: 'Get ticket detail',
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getTicketById(
    @Param('id') id: string,
    @Query('checkout') checkout?: string,
  ) {
    const checkoutFlag = checkout === 'true';
    return await this.queryBus.execute(new GetTicketByIdQuery(id, checkoutFlag));
  }
}
