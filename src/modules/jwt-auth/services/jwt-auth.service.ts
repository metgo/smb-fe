import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtDecode from 'jwt-decode';

import { IJWTUser, ITokens, ITokenUser } from 'src/modules/jwt-auth/jwt.types';
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

  decode(token: string) {
    const user: IJWTUser = jwtDecode(token);
    return user;
  }
}
