import { Module, forwardRef } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VoucherSchema } from './schema/voucher.schema';
import { CampaignModule } from '../campaign/campaign.module';
import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { ConfigModule } from 'src/services/config/config.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { UsersModule } from '../users/users.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { PaymentsModule } from 'src/services/payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Voucher', schema: VoucherSchema },
    ]),
    CampaignModule,
    EncryptionModule,
    ConfigModule,
    GcpBucketModule,
    UsersModule,
    forwardRef(() => PaymentsModule),
    MailChimpModule,
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
