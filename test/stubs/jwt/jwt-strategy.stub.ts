import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/services/config/config.service';

@Injectable()
export class JwtAuthStrategyStub extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const getToken = req => req.accTok || ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const configService = new ConfigService();

    super({
      jwtFromRequest: getToken,
      ignoreExpiration: false,
      secretOrKey: configService.JWT.ACCESS_TOKEN,
    });
  }

  async validate(payload) {
    return await payload;
  }
}
