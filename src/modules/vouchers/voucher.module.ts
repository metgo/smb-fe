import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VoucherSchema } from './schema/voucher.schema';
import { CampaignModule } from '../campaign/campaign.module';
import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { ConfigModule } from 'src/services/config/config.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { UsersModule } from '../users/users.module';

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
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
