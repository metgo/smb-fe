import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthorityModule } from 'src/modules/authority/authority.module';
import { PaymentsService } from './payments.service';
import { ConfigModule } from '../config/config.module';
import { PaymentsController } from './payments.controller';
import { PaymentSchema } from './schema/payments.schema';
import { ExternalApiModule } from 'src/modules/external-api/external-api.module';
import { OrdersModule } from 'src/modules/orders/orders.modules';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { GaMeasurementModule } from 'src/modules/ga-measurement/ga-measurement.module';
import { BusinessModule } from 'src/modules/business/business.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';
import { DocUploadModule } from 'src/modules/doc-upload/doc-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }]),
    forwardRef(() => AuthorityModule),
    ConfigModule,
    forwardRef(() => DMOModule),
    forwardRef(() => ExternalApiModule),
    forwardRef(() => OrdersModule),
    forwardRef(() => VoucherModule),
    MailChimpModule,
    GaMeasurementModule,
    DocUploadModule,
    forwardRef(() => BusinessModule),
    forwardRef(() => ProductsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
