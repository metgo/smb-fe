import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtAuthService } from 'src/modules/jwt-auth/services/jwt-auth.service';
import { JwtAuthStrategy } from 'src/modules/jwt-auth/jwt-auth.strategy';
import { JwtStrategyProvider } from 'src/modules/jwt-auth/providers/jwt-strategy.provider';
import { ConfigModule } from 'src/services/config/config.module';
import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: configService.JWT.ACCESS_TOKEN,
      signOptions: { expiresIn: configService.JWT.TOKEN_EXPIRES },
    }),
    ConfigModule,
  ],
  providers: [JwtAuthStrategy, JwtAuthService, JwtStrategyProvider],
  exports: [JwtModule, JwtAuthService],
})
export class JwtAuthModule {}
