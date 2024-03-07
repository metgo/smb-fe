import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { CreateEventsDto, UpdateEventDto } from 'src/modules/business/dto';
import { GetAllBusinessesForGuestQuery } from 'src/modules/business/queries';
import { EventsService } from 'src/modules/business/services/event.service';

@Controller()
export class EventController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: ['Events'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.EVENTS.CREATED,
    },
    noAuthToken: true,
    operation: 'Create an event by any logged in user',
  })
  @Post('events')
  async createEvent(
    @Req() request,
    @Res() response: Response,
    @Body() dto: CreateEventsDto,
  ) {
    const events = await this.eventsService.createEvents(dto, request.user.id);

    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.EVENTS.CREATED,
      events,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Events'],
    response: { status: HttpStatus.OK, description: ServerSuccess.EVENTS.LISTED },
    softBlockExtraDtoFields: true,
    operation: 'Get all approved events by any user - paginated',
  })
  @Get('events')
  async getAllEvents(
    @Res() response: Response,
    @Query() query?: GetAllBusinessesForGuestQuery,
  ) {
    const events = await this.eventsService.getAllEvents(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EVENTS.LISTED,
      events,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Events'],
    response: { status: HttpStatus.OK, description: ServerSuccess.EVENTS.LISTED },
    operation: 'Get approved events detail by any user',
  })
  @Get('events/:id')
  async getEventDetailForAll(
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const event = await this.eventsService.getEvents({
      id,
      loggedInUser: null,
    });

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EVENTS.LISTED,
      event,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Events'],
    response: { status: HttpStatus.OK, description: ServerSuccess.EVENTS.UPDATED },
    noAuthToken: true,
    params: [{ name: 'eventId', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @Patch('events/:eventId')
  async updateEvent(
    @Req() request,
    @Res() response: Response,
    @Param('eventId') eventId: string,
    @Body() body: UpdateEventDto,
  ) {
    const event = await this.eventsService.updateEvent(
      eventId,
      request.user,
      body,
    );

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EVENTS.UPDATED,
      event,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Events'],
    response: { status: HttpStatus.OK, description: ServerSuccess.EVENTS.DELETED },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
  })
  @UseGuards(JwtAuthGuard)
  @Delete('events/:id')
  async deleteEvent(
    @Req() request,
    @Res() response:Response,
    @Param('id') eventId: string,
  ) {
    const event = await this.eventsService.deleteEvent(eventId, request.user.id);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.EVENTS.DELETED,
      event,
      null,
      null,
    );
  }
}
