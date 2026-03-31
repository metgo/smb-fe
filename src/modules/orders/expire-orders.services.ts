import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { PaymentStatus } from 'src/common/enum';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { OrdersService } from 'src/modules/orders/orders.services';

const PAYMENT_TIMEOUT_MINUTES = 15;

@Injectable()
export class ExpireOrderService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Order.name)
    private readonly OrderModel: Model<Order>,
    private readonly ordersService: OrdersService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async expireUnpaidOrdersAndProcessRefundVoucher(): Promise<void> {
    try {
      const cutoff = new Date(Date.now() - PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

      const expiredOrders = await this.OrderModel.find(
        {
          paymentStatus: PaymentStatus.PENDING,
          createdAt: { $lt: cutoff },
        },
        { _id: 1 },
      ).lean();

      if (!expiredOrders.length) return;

      this.logger.info(
        `[ORDER TASK]: Found ${expiredOrders.length} unpaid order(s) past ${PAYMENT_TIMEOUT_MINUTES}min — cancelling and refunding vouchers`,
      );

      await Promise.all(
        expiredOrders.map(order => this.ordersService.updateAfterPaymentFailure(order._id.toString())),
      );
    } catch (err) {
      this.logger.error('[ORDER TASK]: Failed to expire unpaid orders', {
        err: err.message,
      });
    }
  }
}
