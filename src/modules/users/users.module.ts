import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from 'src/modules/users/schema/users.schema';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.services';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { ConfigModule } from 'src/services/config/config.module';
import { HashModule } from 'src/services/hash/hash.module';
import { MailModule } from 'src/services/mail/mail.module';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { OTP, OTPSchema } from './schema/otp.schema';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: OTP.name, schema: OTPSchema }]),
    ConfigModule,
    MailModule,
    HashModule,
    JwtAuthModule,
    MailChimpModule,
    forwardRef(() => VoucherModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
