import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from 'src/modules/users/users.module';
import { AuthService } from 'src/modules/auth/auth.services';
import { AuthController } from 'src/modules/auth/auth.controller';
import { JwtAuthModule } from 'src/modules/jwt-auth/jwt-auth.module';
import { ConfigService } from 'src/services/config/config.service';

const configService = new ConfigService();

@Module({
  imports: [
    UsersModule,
    JwtAuthModule,
    JwtModule.register({
      global: true,
      secret: configService.get('ACCESS_TOKEN'),
      signOptions: { expiresIn: configService.get('JWT_TOKEN_EXPIRES') },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
