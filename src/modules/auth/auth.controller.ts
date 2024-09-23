import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Put,
  BadRequestException,
  Get,
  Query,
  Param,
  Patch,
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
import { RegisterStep1Request } from 'src/modules/auth/requests/register-step1.request';
import { RegisterStep2Request } from 'src/modules/auth/requests/register-step2.request';
import { SignInRequest } from 'src/modules/auth/requests/signin.request';
import { GetUserDetailsResponse } from 'src/modules/users/responses/get-user-details.response';
import { UsersService } from 'src/modules/users/users.services';
import { OTPPurpose } from 'src/modules/users/users.type';
import { ChangePasswordDto } from './requests/change-password.dto';
import { Response } from 'express';
import {
  EmailDTO,
  SendOtpToEmailDTO,
  UpdatePasswordDto,
} from './requests/forget-password.dto';
import { responseHelper } from 'src/core/helper/response.helper';
import { VerifyOtpDto } from './requests/verify-otp.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiInternalServerErrorResponse({
    description: "Couldn't find user with given email",
  })
  @ApiNotFoundResponse({ description: ServerErrors.USER.NOT_FOUND })
  @ApiOperation({ summary: 'Login to system' })
  @Post('login')
  async login(@Body() body: SignInRequest) {
    return await this.authService.login(body);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiConflictResponse({ description: ServerErrors.USER.EXISTS })
  @ApiCreatedResponse({ type: GetUserDetailsResponse })
  @ApiInternalServerErrorResponse({ description: "Couldn't save user" })
  @ApiOperation({ summary: 'Register new user' })
  @Post('register-step1')
  async registerStep1(@Body() body: RegisterStep1Request) {
    return await this.userService.createStep1(body);
  }

  @HttpCode(HttpStatus.OK)
  @ApiConflictResponse({ description: ServerErrors.USER.EXISTS })
  @ApiCreatedResponse({ type: GetUserDetailsResponse })
  @ApiInternalServerErrorResponse({ description: "Couldn't save user" })
  @ApiOperation({ summary: 'Register new user' })
  @Patch('register-step2/:userId')
  async registerStep2(
    @Body() body: RegisterStep2Request,
    @Param('userId') userId: string,
  ) {
    const user = await this.userService.updateForStep2(userId, body);
    return await this.authService.login({
      email: user.email,
      password: body.password,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiEndpoint({
    tags: [],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.CHANGEPASSWORD,
    },
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
    const user = await this.userService.changePassword(req.user.id, dto);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.CHANGEPASSWORD,
      user,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: [],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.FORGET_PASSWORD,
    },
    operation: 'forget password - send otp',
  })
  @Post('send-otp')
  async forgetPassword(
    @Res() response: Response,
    @Body() dto: SendOtpToEmailDTO,
  ) {
    const user
      = dto.purpose !== OTPPurpose.RECOVER_ACCOUNT
        ? await this.userService.findByEmail(dto.email)
        : await this.userService.findOne(dto.email);

    const token = await this.userService.generateOtp(user, dto.purpose);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.FORGET_PASSWORD,
      null,
      null,
      token,
    );
  }

  @ApiEndpoint({
    tags: [],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.FORGET_PASSWORD,
    },
    operation: 'verify your code',
  })
  @Post('verify-otp')
  async verifyOtp(@Res() response: Response, @Body() dto: VerifyOtpDto) {
    await this.userService.verifyOtp(dto);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.OTP.VERIFY,
      null,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: [],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.FORGET_PASSWORD,
    },
    operation: 'Update password',
  })
  @Post('forget-password')
  async updatePassword(
    @Res() response: Response,
    @Body() dto: UpdatePasswordDto,
  ) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password Not Match');
    }
    await this.userService.updatePassword(dto);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.UPDATED,
      null,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Auth'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.RECOVER,
    },
    operation: 'Recover user account',
  })
  @Post('recover-account')
  async recoverUserAccount(@Res() response: Response, @Body() body: EmailDTO) {
    await this.userService.recoverUserAccount(body.email);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.RECOVER,
      null,
      null,
      null,
    );
  }

  @ApiEndpoint({
    tags: ['Auth'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.RECOVER,
    },
    operation: 'Unblock user account',
  })
  @Post('unblock-account')
  async unblockUserAccount(@Res() response: Response, @Body() body: EmailDTO) {
    await this.userService.unblockUserAccount(body.email);

    return responseHelper(
      response,
      HttpStatus.OK,
      ServerSuccess.USER.UNBLOCK,
      null,
      null,
      null,
    );
  }

  // OAuth
  @ApiEndpoint({
    tags: ['Google OAuth'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.RECOVER,
    },
    operation: 'Login Via Google',
  })
  @Get('google/url')
  getGoogleAuthURL(@Res() res) {
    const url = this.authService.getGoogleAuthURL();

    return res.redirect(url);
  }

  @ApiEndpoint({
    tags: ['Google OAuth'],
    response: {
      status: HttpStatus.OK,
      description: ServerSuccess.USER.RECOVER,
    },
    operation: 'Login Via Google',
  })
  @Get('google')
  async getGoogleUser(@Query('code') code: string, @Res() res) {
    return await this.authService.getGoogleUser(res, code);
  }
}
