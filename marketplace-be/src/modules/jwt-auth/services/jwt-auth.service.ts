import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtDecode from 'jwt-decode';

import {
  IJWTOtp,
  ITokenOtp,
  ITokens,
  ITokenUser,
  OtpToken,
} from 'src/modules/jwt-auth/jwt.types';
import { ConfigService } from 'src/services/config/config.service';

@Injectable()
export class JwtAuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  login(user: ITokenUser): ITokens {
    const userPayload = { ...user };
    const {
      ACCESS_TOKEN,
      ACCESS_TOKEN_EXPIRATION,
      REFRESH_TOKEN,
      REFRESH_TOKEN_EXPIRATION,
    } = this.configService.JWT;

    return {
      accessToken: this.jwtService.sign(userPayload, {
        secret: ACCESS_TOKEN,
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      }),
      refreshToken: this.jwtService.sign(userPayload, {
        secret: REFRESH_TOKEN,
        expiresIn: REFRESH_TOKEN_EXPIRATION,
      }),
    };
  }

  otpToken(otp: ITokenOtp): OtpToken {
    const otpPayload = { ...otp };
    const { ACCESS_TOKEN, OTP_EXPIRATION } = this.configService.JWT;
    return {
      otpToken: this.jwtService.sign(otpPayload, {
        secret: ACCESS_TOKEN,
        expiresIn: OTP_EXPIRATION,
      }),
    };
  }

  otpDecode(token: string) {
    const otp: IJWTOtp = jwtDecode(token);
    return otp;
  }
}
