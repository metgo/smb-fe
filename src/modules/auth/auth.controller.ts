import {
  Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Req, Res, Put, BadRequestException,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ServerErrors, ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { JwtAuthGuard } from 'src/core/guards/jwt/jwt.guards';
import { AuthService } from 'src/modules/auth/auth.services';
import { RegisterRequest } from 'src/modules/auth/requests/register.request';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import { GetUserDetailsResponse } from 'src/modules/users/responses/get-user-details.response';
import { UsersService } from 'src/modules/users/users.services';
import { ChangePasswordDto } from './requests/change-password.dto';
import { responseHelper } from 'src/core/helper/response.helper';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiInternalServerErrorResponse({ description: 'Couldn\'t find user with given email' })
  @ApiNotFoundResponse({ description: ServerErrors.USER.NOT_FOUND })
  @ApiOperation({ summary: 'Login to system' })
  @Post('login')
  async login(@Body() body: SignInRequest) {
    return await this.authService.login(body);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiConflictResponse({ description: ServerErrors.USER.EXISTS })
  @ApiCreatedResponse({ type: GetUserDetailsResponse })
  @ApiInternalServerErrorResponse({ description: 'Couldn\'t save user' })
  @ApiOperation({ summary: 'Register new user' })
  @Post('register')
  async register(@Body() body: RegisterRequest) {
    await this.userService.create(body);
    return await this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: [],
    response: { status: 200, description: ServerSuccess.USER.CHANGEPASSWORD },
    softBlockExtraDtoFields: true,
    noAuthToken: true,
    operation: 'change your password',
  })
  @Put('change-password')
  async changePassword(
    @Req() req,
    @Res() response: Response,
    @Body() dto: ChangePasswordDto,
  ) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException(ServerErrors.USER.NOT_MATCH);
    }
    await this.userService.changePassword(req.user.email, dto);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.CHANGEPASSWORD,
      null,
      null,
      null,
    );
  }
}
