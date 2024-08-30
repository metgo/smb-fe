import {
  Controller, Get, HttpStatus, Query, Res,
} from '@nestjs/common';
import { Response } from 'express';

import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { responseHelper } from 'src/core/helper/response.helper';
import { GoogleAnalyticsService } from 'src/services/google-analytics/ga.services';
import { ServerSuccess } from 'src/common/constant';
import { GetUserEngagementQuery } from 'src/services/google-analytics/queries/get-user-engagement.queries';

@Controller()
export class GAController {
  constructor(private gaServices: GoogleAnalyticsService) {}

  @ApiEndpoint({
    tags: ['Google Analytics'],
  })
  @Get('users-engagement')
  async usersEngagement(
    @Res() response: Response,
    @Query() query: GetUserEngagementQuery,
  ) {
    const data = await this.gaServices.userEngagementData(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER_ENGAGEMENT.LISTED,
      data,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Google Analytics'],
  })
  @Get('users-engagement-time')
  async engagementTime(
    @Res() response: Response,
    @Query() query: GetUserEngagementQuery,
  ) {
    const data = await this.gaServices.engagementTime(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER_ENGAGEMENT.LISTED,
      data,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Google Analytics'],
  })
  @Get('active-users')
  async activeUsers(
    @Res() response: Response,
    @Query() query: GetUserEngagementQuery,
  ) {
    const data = await this.gaServices.activeUserData(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER_ENGAGEMENT.LISTED,
      data,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Google Analytics'],
  })
  @Get('page-views')
  async views(
    @Res() response: Response,
    @Query() query: GetUserEngagementQuery,
  ) {
    const data = await this.gaServices.views(query);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER_ENGAGEMENT.LISTED,
      data,
      null,
      null,
    );
  }
}
