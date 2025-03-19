import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { CampaignModule } from 'src/modules/campaign/campaign.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { UsersModule } from 'src/modules/users/users.module';
import { CreateVouchersHandler } from 'src/modules/vouchers/commands/handler/create-voucher.handler';
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
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { CartModule } from 'src/modules/cart/cart.modules';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: 'Voucher', schema: VoucherSchema }]),
    forwardRef(() => AuthorityModule),
    forwardRef(() => CampaignModule),
    forwardRef(() => DMOModule),
    EncryptionModule,
    forwardRef(() => ExternalApiModule),
    CartModule,
    ConfigModule,
    forwardRef(() => UsersModule),
    forwardRef(() => PaymentsModule),
    MailChimpModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => RewardsModule),
    ProductsModule,
  ],
  controllers: [VoucherController],
  providers: [VoucherService, CreateVouchersHandler],
  exports: [VoucherService],
})
export class VoucherModule {}
