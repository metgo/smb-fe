import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigModule } from '../config/config.module';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './schema/payments.schema';
import { VoucherModule } from 'src/modules/vouchers/voucher.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Payment', schema: PaymentSchema },
    ]),
    ConfigModule,
    forwardRef(() => VoucherModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
