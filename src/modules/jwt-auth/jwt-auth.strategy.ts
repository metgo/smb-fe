import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const getToken = req => req.accTok || ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    super({
      jwtFromRequest: getToken,
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_TOKEN'),
    });
  }

  async validate(payload) {
    return payload;
  }
}
