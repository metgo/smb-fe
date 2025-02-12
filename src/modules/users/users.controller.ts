import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  // Post,
  // Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
// import { Roles } from 'src/core/guards/authorization/roles';
import { responseHelper } from 'src/core/helper/response.helper';
// import { GetAllUsersQuery } from 'src/modules/users/queries/get-all-users.query';
// import { createUserByAdminDto } from 'src/modules/users/requests/create-user-ByAdmin.dto';
import { UsersService } from 'src/modules/users/users.services';
import { JwtExternalApiAuthGuard } from 'src/core/guards/jwt/jwt-externalapi.guards';
import { GetAllUsersQuery } from './queries/get-all-users.query';
import { UserType } from 'src/modules/users/users.type';

@Controller('/users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Users'],
    response: { status: HttpStatus.OK, description: ServerSuccess.USER.LISTED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get list of all users',
  })
  @Roles(UserType.EXTERNAL_API_ADMIN)
  @UseGuards(JwtExternalApiAuthGuard)
  @Get('')
  async getAllUsers(
    @Query() query: GetAllUsersQuery,
    @Req() req,
    @Res() response: Response,
  ) {
    const users = await this.userService.getAllUsers(query, req.user);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.LISTED,
      users,
      null,
      null,
    );
  }
}
