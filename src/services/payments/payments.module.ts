import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigModule } from '../config/config.module';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './schema/payments.schema';
import { OrdersModule } from 'src/modules/orders/orders.modules';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';
import { MailChimpModule } from 'src/services/mailchimp/mailchimp.module';
import { BusinessModule } from 'src/modules/business/business.module';
import { DMOModule } from 'src/modules/dmo/dmo.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Payment', schema: PaymentSchema }]),
    ConfigModule,
    DMOModule,
    forwardRef(() => OrdersModule),
    forwardRef(() => VoucherModule),
    MailChimpModule,
    BusinessModule,
    ProductsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
