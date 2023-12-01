import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './schema/payments.schema';
import mongoose, { Model } from 'mongoose';
import { Request } from 'express';
import { update } from 'src/core/helper/query-helper';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { Currency, VoucherPaymentStatus } from 'src/common/enum';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { OrdersService } from 'src/modules/orders/orders.services';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel('Payment')
    private readonly PaymentModel: Model<Payment>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) { }

  async createPayment(insertField:any) {
    return await this.PaymentModel.create(insertField);
  }

  async generateLink(
    amount: number,
    currency: Currency,
    purpose: PaymentPurpose,
    id: [mongoose.Types.ObjectId] | mongoose.Types.ObjectId,
  ) {
    const payPlusResponse = await axios.post(
      `${this.configService.paymentDetails.URL}PaymentPages/generatelink`,
      {
        payment_page_uid: this.configService.paymentDetails.PAGE_UUID,
        amount,
        currency_code: currency,
        refURL_success: `${this.configService.paymentDetails.SERVER_URL}${this.configService.paymentDetails.SUCCESS}`,
        refURL_failure: `${this.configService.paymentDetails.SERVER_URL}${this.configService.paymentDetails.FAILURE}`,
        more_info: purpose,
      },
      {
        headers: {
          ContentType: 'application/json',
          Authorization: `{"api_key": "${this.configService.paymentDetails.API}","secret_key": "${this.configService.paymentDetails.SECRET}"}`,
        },
      },
    );
    let insertField;
    if (purpose === PaymentPurpose.VOUCHER) {
      insertField = {
        purpose,
        amount,
        currency,
        voucherId: id,
        paymentRequestId: payPlusResponse.data.data.page_request_uid,
      };
    }

    if (purpose === PaymentPurpose.ORDER) {
      insertField = {
        purpose,
        amount,
        currency,
        orderId: id,
        paymentRequestId: payPlusResponse.data.data.page_request_uid,
      };
    }

    if (payPlusResponse.data.results.status === 'success') {
      await this.createPayment(insertField);
    }

    return payPlusResponse.data;
  }

  async paymentSucess(request: Request) {
    const requestData:any = request.query;
    const requestUid = requestData.page_request_uid.toString();
    const updateField = {
      customerName: requestData.customer_name,
      identificationNumber: requestData.identification_number,
      customerEmail: requestData.customer_email,
      method: requestData.method,
    };
    const payments = await update<Payment>(
      this.PaymentModel,
      'paymentRequestId',
      requestUid,
      updateField,
    );
    if (payments.purpose === PaymentPurpose.VOUCHER) {
      await this.voucherService.update(payments.voucherId, { paymentStatus: VoucherPaymentStatus.PAID });
    }
    if (payments.purpose === PaymentPurpose.ORDER) {
      await this.ordersService.updateOrderAfterPayment(payments.orderId);
    }
  }

  PaymentFailure() {}
}
