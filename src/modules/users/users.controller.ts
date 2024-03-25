import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Response } from 'express';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { Roles } from 'src/core/guards/authorization/roles';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { createUserByAdminDto } from 'src/modules/users/requests/create-user-ByAdmin.dto';
import { UpdateUserRequest } from 'src/modules/users/requests/update-user.request';
import { UsersService } from 'src/modules/users/users.services';
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
    operation: 'Get My Information',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async me(@Req() req, @Res() response: Response) {
    const user = await this.userService.getMyInformation(req.user.id);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.LISTED,
      user,
      null,
      null,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Users'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.UPDATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Update My Information',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('/me')
  async updateMyInfo(
    @Body() body: UpdateUserRequest,
    @Req() req,
    @Res() response: Response,
  ) {
    await this.userService.findByFieldNameExcludeId(
      'email',
      body.email,
      req.user.id,
    );
    const user = await this.userService.update(req.user.id, req.user.id, body);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.UPDATED,
      user,
      null,
      null,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Users'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.UPDATED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: "Update User's Information",
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  async updateUser(
    @Body() body: UpdateUserRequest,
    @Param('userId') userId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    await this.userService.findByFieldNameExcludeId(
      'email',
      body.email,
      userId,
    );
    const user = await this.userService.update(userId, req.user.id, body);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.UPDATED,
      user,
      null,
      null,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Users'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.DELETED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Delete Me',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('/me')
  async softDeleteMe(@Req() req, @Res() response: Response) {
    const user = await this.userService.softDeleteAllowRecovery(
      req.user.id,
      req.user.id,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.DELETED,
      user,
      null,
      null,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Users'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.DELETED,
    },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: "Delete User's Information can be restored within 30 days",
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @Delete('/:userId')
  async softDeleteUser(
    @Param('userId') userId: string,
    @Req() req,
    @Res() response: Response,
  ) {
    const user = await this.userService.softDeleteAllowRecovery(
      userId,
      req.user.id,
    );
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.DELETED,
      user,
      null,
      null,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Users'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.HARD_DELETED,
    },
    operation: "Delete User's Information and can no longer be recovered",
  })
  @Cron('0 0 * * *')
  @Post('schedule-delete')
  async softDelete() {
    return await this.userService.handleDelete();
  }

  // for admin

  @ApiEndpoint({
    tags: ['Admin', 'Users'],
    response: {
      status: HttpStatus.CREATED,
      description: ServerSuccess.USER.CREATED,
    },
    noAuthToken: true,
    softBlockExtraDtoFields: true,
    operation: 'Create User By Admin',
  })
  @Roles(UserType.SUPERADMIN, UserType.DMO)
  @UseGuards(JwtAuthGuard)
  @Post('admin')
  async adminCreateUser(
    @Req() req,
    @Res() response: Response,
    @Body() dto: createUserByAdminDto,
  ) {
    const newUser = await this.userService.adminCreateUser(dto, req.user);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.USER.CREATED,
      newUser,
      null,
      null,
    );
  }
}
