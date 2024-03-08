import {
  Body, Controller, Post, HttpCode, HttpStatus,
} from '@nestjs/common';

import { ServerSuccess } from 'src/common/constant';
import { ApiEndpoint } from 'src/core/decorators/apiEndpoint.decorator';
import { AuthService } from 'src/modules/auth/auth.services';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import { ExternalApiRegisterRequest } from 'src/modules/external-api/dto/register-user.dto';
import { ExternalApiServices } from 'src/modules/external-api/external-api.service';

@Controller('external-api/auth')
export class ExternalAPIServiceController {
  constructor(
    private authService: AuthService,
    private externalApiService: ExternalApiServices,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    tags: ['External API'],
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
    tags: ['External API'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.CREATED,
    },
    softBlockExtraDtoFields: true,
  })
  @Post('register')
  async register(@Body() body: ExternalApiRegisterRequest) {
    await this.externalApiService.registerUser(body);
    return await this.authService.login(body);
  }
}
