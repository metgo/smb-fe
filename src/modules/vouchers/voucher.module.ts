import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { UsersModule } from 'src/modules/users/users.module';
import { VoucherController } from 'src/modules/vouchers/voucher.controller';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { VoucherSchema } from 'src/modules/vouchers/schema/voucher.schema';
import { OrdersModule } from 'src/modules/orders/orders.modules';
import { ProductsModule } from 'src/modules/products/products.module';
import { RewardsModule } from 'src/modules/rewards/rewards.module';
import { ConfigModule } from 'src/services/config/config.module';
import { EncryptionModule } from 'src/services/encryption/encryption.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { PaymentsModule } from 'src/services/payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Voucher', schema: VoucherSchema }]),
    forwardRef(() => AuthorityModule),
    CampaignModule,
    forwardRef(() => DMOModule),
    EncryptionModule,
    ConfigModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PaymentsModule),
    MailChimpModule,
    OrdersModule,
    RewardsModule,
    ProductsModule,
  ],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
