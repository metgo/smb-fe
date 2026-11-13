import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Business,
  BusinessSchema,
} from 'src/modules/business/shared/schema/business.schema';
import { ConfigModule } from 'src/services/config/config.module';
import { GcpBucketModule } from 'src/services/gcp-bucket/gcp-bucket.module';
import { GoogleWalletService } from 'src/services/google-wallet/google-wallet.service';

@Module({
  imports: [
    ConfigModule,
    GcpBucketModule,
    MongooseModule.forFeature([{ name: Business.name, schema: BusinessSchema }]),
  ],
  providers: [GoogleWalletService],
  exports: [GoogleWalletService],
})
export class GoogleWalletModule {}
