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

@UseGuards(JwtAuthGuard)
@Controller('/users')
export class UsersController {
  constructor(
      private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Users'],
    response: { status: HttpStatus.CREATED, description: ServerSuccess.USER.CREATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Get My Information',
  })
  @Get('/me')
  async me(
    @Req() req,
    @Res() response: Response,
  ) {
    const user = await this.userService.getMyInformation(req.user.id);
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.USER.CREATED,
      user,
      null,
      null,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Users'],
    response: { status: HttpStatus.OK, description: ServerSuccess.USER.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Update My Information',
  })
  @Patch('/me')
  async updateMyInfo(
    @Body() body: UpdateUserRequest,
    @Req() req,
    @Res() response: Response,
  ) {
    const user = await this.userService.update(req.user.id, body);
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
    response: { status: HttpStatus.OK, description: ServerSuccess.USER.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Update User\'s Information',
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @Patch(':userId')
  async updateUser(
    @Body() body: UpdateUserRequest,
    @Param('userId') userId: string,
    @Res() response: Response,
  ) {
    const user = await this.userService.update(userId, body);
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
    response: { status: HttpStatus.OK, description: ServerSuccess.USER.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Delete Me',
  })
  @Delete('/me')
  async softDeleteMe(
    @Req() req,
    @Res() response: Response,
  ) {
    const user = await this.userService.softDelete(req.user.id);
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
    response: { status: HttpStatus.OK, description: ServerSuccess.USER.UPDATED },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'Delete User\'s Information',
  })
  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @Delete('/:userId')
  async softDeleteUser(
    @Param('userId') userId: string,
    @Res() response: Response,
  ) {
    const user = await this.userService.softDelete(userId);
    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.DELETED,
      user,
      null,
      null,
    );
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
  @Roles(UserType.SUPERADMIN, UserType.ADMIN, UserType.DMO)
  @Post('admin')
  async adminCreateUser(@Res() response: Response, @Body() dto: createUserByAdminDto) {
    const newUser = await this.userService.adminCreateUser(dto);
    await newUser.save();
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
