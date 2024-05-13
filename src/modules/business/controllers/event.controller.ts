/* eslint-disable no-undef */
import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import {
  CreateEventsDto,
  UpdateEventDto,
  UpdateEventsByAdminDto,
} from 'src/modules/business/dto';
import { EventsService } from 'src/modules/business/services/event.service';
import { UserType } from 'src/modules/users/users.type';
import { fileFilterByExtensions } from 'src/services/gcp-bucket/middleware/file-filter';

@Controller()
export class EventController {
  constructor(private readonly eventsService: EventsService) {}

  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMOADMIN,
    UserType.DMO,
    UserType.SUPERADMIN,
  )
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
  @UseInterceptors(AnyFilesInterceptor({ fileFilter: fileFilterByExtensions }))
  async createEvent(
    @Req() request,
    @Res() response: Response,
    @Body() dto: CreateEventsDto,
    @UploadedFiles() image: Array<Express.Multer.File>,
  ) {
    const events = await this.eventsService.createEvents(
      dto,
      request.user,
      image,
    );
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
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EVENTS.UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'eventId', type: 'string', required: true }],
  })
  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMOADMIN,
    UserType.DMO,
    UserType.SUPERADMIN,
  )
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
    tags: ['Admin', 'Events'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EVENTS.UPDATED,
    },
    noAuthToken: true,
    params: [{ name: 'eventId', type: 'string', required: true }],
  })
  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMOADMIN,
    UserType.DMO,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @Patch('admin/events/:eventId')
  async updateEventByAdmin(
    @Req() request,
    @Res() response: Response,
    @Param('eventId') eventId: string,
    @Body() body: UpdateEventsByAdminDto,
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
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.EVENTS.DELETED,
    },
    noAuthToken: true,
    params: [{ name: 'id', type: 'string', required: true }],
  })
  @Roles(
    UserType.ADMIN,
    UserType.AUTHORITY,
    UserType.DMOADMIN,
    UserType.DMO,
    UserType.SUPERADMIN,
  )
  @UseGuards(JwtAuthGuard)
  @Delete('events/:id')
  async deleteEvent(
    @Req() request,
    @Res() response: Response,
    @Param('id') eventId: string,
  ) {
    const event = await this.eventsService.deleteEvent(
      eventId,
      request.user.id,
    );

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
