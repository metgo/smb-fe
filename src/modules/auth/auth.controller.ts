import {
  Body, Controller, Post, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ServerErrors } from 'src/common/constant';
import { AuthService } from 'src/modules/auth/auth.services';
import { RegisterRequest } from 'src/modules/auth/requests/register.request';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import { GetUserDetailsResponse } from 'src/modules/users/responses/get-user-details.response';
import { UsersService } from 'src/modules/users/users.services';

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
    return await this.userService.create(body);
  }
}
