import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.services';
import { GoogleOauthClientProvider } from 'src/modules/auth/providers/google-oauth-client-provider';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { JwtAuthModule } from 'src/modules/jwt-auth/jwt-auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { ConfigModule } from 'src/services/config/config.module';
import { ConfigService } from 'src/services/config/config.service';
import { HashModule } from 'src/services/hash/hash.module';

const configService = new ConfigService();

@Module({
  imports: [
    UsersModule,
    AuthorityModule,
    ConfigModule,
    DMOModule,
    ExternalApiModule,
    JwtAuthModule,
    JwtModule.register({
      global: true,
      secret: configService.JWT.ACCESS_TOKEN,
      signOptions: { expiresIn: configService.JWT.TOKEN_EXPIRES },
    }),
    HashModule,
    HttpModule,
  ],
  providers: [AuthService, GoogleOauthClientProvider],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
