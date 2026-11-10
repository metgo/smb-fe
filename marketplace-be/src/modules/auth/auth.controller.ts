import {
  Body, Controller, Post, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { AuthService } from 'src/modules/auth/auth.services';
import { UsersService } from 'src/modules/users/users.services';

import { RegisterRequest } from 'src/modules/auth/requests/register.request';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['Auth'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.CREATED,
    },
    softBlockExtraDtoFields: true,
  })
  @Post('login')
  async login(@Body() body: SignInRequest) {
    return await this.authService.login(body);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiEndpoint({
    tags: ['Auth'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.CREATED,
    },
    softBlockExtraDtoFields: true,
  })
  @Post('register')
  async register(@Body() body: RegisterRequest) {
    await this.authService.registerUser(body);
    return await this.authService.login(body);
  }
}
