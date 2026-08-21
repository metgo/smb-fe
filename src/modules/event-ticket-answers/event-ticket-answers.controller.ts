import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import { IsMongoId } from 'class-validator';

import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { EventTicketAnswersService } from './event-ticket-answers.service';
import { CreateEventTicketAnswerDto } from './dto/create-event-ticket-answer.dto';
import { GetQuestionsByTicketIdsDto } from './dto/get-questions-by-ticket-ids.dto';

class EventIdParam {
  @IsMongoId()
    eventId: string;
}

@Controller('event-ticket-answers')
export class EventTicketAnswersController {
  constructor(
    private readonly eventTicketAnswersService: EventTicketAnswersService,
  ) {}

  /**
   * Called by the FE at checkout with the ticketIds in the cart, to render the
   * custom-question form. Returns questions grouped per event — same shape the
   * FE then fills in and POSTs back to create the answer documents below.
   *
   * Registered before ':eventId' below so this static path isn't swallowed by
   * the dynamic route.
   */
  @ApiEndpoint({
    tags: ['Event Ticket Answers'],
    operation: 'Get custom questions for tickets, grouped by event',
    response: {
      status: HttpStatus.OK,
      description: 'Custom questions fetched successfully',
    },
    noAuthToken: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get('questions')
  async getQuestions(@Query() query: GetQuestionsByTicketIdsDto) {
    const data = await this.eventTicketAnswersService.getQuestionsByTicketIds(
      query.ticketIds,
    );
    return { message: 'Custom questions fetched successfully', data };
  }

  /**
   * Called by the FE with a single eventId in the URL — returns that event's
   * custom questions: { message, data: [{ _id, question, isRequired }] }.
   */
  @ApiEndpoint({
    tags: ['Event Ticket Answers'],
    operation: 'Get custom questions for a single event',
    response: {
      status: HttpStatus.OK,
      description: 'Custom questions fetched successfully',
    },
    params: [{ name: 'eventId', type: 'string', required: true }],
    noAuthToken: true,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':eventId')
  async getQuestionsByEventId(@Param() params: EventIdParam) {
    const data = await this.eventTicketAnswersService.getQuestionsByEventId(
      params.eventId,
    );
    return { message: 'Custom questions fetched successfully', data };
  }

  /**
   * Called by the FE when the customer continues from the checkout details step.
   * Body is an array — one entry per event in the cart, so a single checkout
   * spanning multiple events creates one EventTicketAnswer document per event.
   */
  @ApiEndpoint({
    tags: ['Event Ticket Answers'],
    operation: 'Submit custom question answers for ticket(s) at checkout',
    response: {
      status: HttpStatus.CREATED,
      description: 'Event ticket answers saved successfully',
    },
    noAuthToken: true,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body(new ParseArrayPipe({ items: CreateEventTicketAnswerDto }))
      dtos: CreateEventTicketAnswerDto[],
  ) {
    const created = await this.eventTicketAnswersService.createMany(dtos);
    return {
      message: 'Event ticket answers saved successfully',
      data: created,
    };
  }
}
