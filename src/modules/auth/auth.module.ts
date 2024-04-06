import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from 'src/modules/users/users.module';
import { AuthService } from 'src/modules/auth/auth.services';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { AuthController } from 'src/modules/auth/auth.controller';
import { JwtAuthModule } from 'src/modules/jwt-auth/jwt-auth.module';
import { ConfigService } from 'src/services/config/config.service';
import { HashModule } from 'src/services/hash/hash.module';

const configService = new ConfigService();

@Module({
  imports: [
    forwardRef(() => UsersModule),
    DMOModule,
    JwtAuthModule,
    JwtModule.register({
      global: true,
      secret: configService.JWT.ACCESS_TOKEN,
      signOptions: { expiresIn: configService.JWT.TOKEN_EXPIRES },
    }),
    HashModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
