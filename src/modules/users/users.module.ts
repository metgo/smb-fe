import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { User, UserSchema } from 'src/modules/users/schema/users.schema';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.services';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { BusinessModule } from 'src/modules/business/business.module';
import { ConfigModule } from 'src/services/config/config.module';
import { HashModule } from 'src/services/hash/hash.module';
import { MailModule } from 'src/services/mail/mail.module';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { OTP, OTPSchema } from './schema/otp.schema';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: OTP.name, schema: OTPSchema },
    ]),
    forwardRef(() => AuthorityModule),
    BusinessModule,
    CampaignModule,
    ConfigModule,
    forwardRef(() => DMOModule),
    ExternalApiModule,
    MailModule,
    HashModule,
    JwtAuthModule,
    MailChimpModule,
    VoucherModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
