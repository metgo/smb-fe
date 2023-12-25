import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtDecode from 'jwt-decode';

import {
  IJWTOtp, ITokenOtp, ITokens, ITokenUser, OtpToken,
} from 'src/modules/jwt-auth/jwt.types';
import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  login(user: ITokenUser): ITokens {
    const userPayload = { ...user };
    return {
      accessToken: this.jwtService.sign(userPayload, {
        secret: configService.get('ACCESS_TOKEN'),
        expiresIn: 86400,
      }),
      refreshToken: this.jwtService.sign(userPayload, {
        secret: configService.get('REFRESH_TOKEN'),
        expiresIn: 86400,
      }),
    };
  }

  otpToken(otp: ITokenOtp): OtpToken {
    const otpPayload = { ...otp };
    return {
      otpToken: this.jwtService.sign(otpPayload, {
        secret: configService.get('ACCESS_TOKEN'),
        expiresIn: 86400,
      }),
    };
  }

  otpDecode(token: string) {
    const otp: IJWTOtp = jwtDecode(token);
    return otp;
  }
}
