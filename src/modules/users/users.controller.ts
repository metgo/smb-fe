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
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { responseHelper } from 'src/core/helper/response.helper';
import { createUserByAdminDto } from 'src/modules/users/requests/create-user-ByAdmin.dto';
import { UpdateUserRequest } from 'src/modules/users/requests/update-user.request';
import { GetUserDetailsResponse } from 'src/modules/users/responses/get-user-details.response';
import { UsersService } from 'src/modules/users/users.services';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('defaultBearerAuth')
@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(
      private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiInternalServerErrorResponse({ description: 'Couldn\'t find user' })
  @ApiNotFoundResponse({ description: ServerErrors.USER.NOT_FOUND })
  @ApiOkResponse({ type: GetUserDetailsResponse })
  @ApiOperation({ summary: 'Get My Information' })
  @Get('/me')
  async me(@Req() req) {
    return await this.userService.getMyInformation(req.user.id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiInternalServerErrorResponse({ description: 'Couldn\'t update user' })
  @ApiNotFoundResponse({ description: ServerErrors.USER.NOT_FOUND })
  @ApiOkResponse({ type: GetUserDetailsResponse })
  @ApiOperation({ summary: 'Update User\'s Information' })
  @Patch(':userId')
  async updateUser(@Body() body: UpdateUserRequest, @Param('userId') userId: string) {
    return await this.userService.update(userId, body);
  }

  @HttpCode(HttpStatus.OK)
  @ApiInternalServerErrorResponse({ description: 'Couldn\'t delete user' })
  @ApiNotFoundResponse({ description: ServerErrors.USER.NOT_FOUND })
  @ApiOkResponse({ type: GetUserDetailsResponse })
  @ApiOperation({ summary: 'Delete User\'s Information' })
  @Delete('/:userId')
  async softDeleteUser(@Param('userId') userId: string) {
    return await this.userService.softDelete(userId);
  }

  // for admin

  @ApiEndpoint({
    tags: ['Admin', 'Admin User'],
    response: {
      status: 201,
      description: ServerSuccess.USER_CREATED,
    },
  })
  @Post('admin/user')
  async adminCreateUser(@Res() response: Response, @Body() dto: createUserByAdminDto) {
    const newUser = await this.userService.adminCreateUser(dto);
    await newUser.save();
    return responseHelper(
      response,
      HttpStatus.CREATED,
      ServerSuccess.USER_CREATED,
      newUser,
      null,
      null,
    );
  }
}
