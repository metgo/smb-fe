import {
  Body,
  Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags,
} from '@nestjs/swagger';

import { UsersService } from 'src/modules/users/users.services';
import { CreateUserRequest } from 'src/modules/users/requests/create-user.request';
import { UpdateUserRequest } from 'src/modules/users/requests/update-user.request';
import { GetUserDetailsResponse } from 'src/modules/users/responses/get-user-details.response';

@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(
      private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetUserDetailsResponse })
  @ApiOperation({ summary: 'Get My Information' })
  @Get('/me')
  async me(@Req() req) {
    return await this.userService.getMyInformation(req.user.id);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: GetUserDetailsResponse })
  @ApiOperation({ summary: 'Create new user' })
  @Post()
  async createUser(@Body() body: CreateUserRequest) {
    return await this.userService.create(body);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetUserDetailsResponse })
  @ApiOperation({ summary: 'Update User\'s Information' })
  @Patch(':userId')
  async updateUser(@Body() body: UpdateUserRequest, @Param('userId') userId: string) {
    return await this.userService.update(userId, body);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: GetUserDetailsResponse })
  @ApiOperation({ summary: 'Delete User\'s Information' })
  @Delete('/:userId')
  async softDeleteUser(@Param('userId') userId: string) {
    return await this.userService.softDelete(userId);
  }
}
