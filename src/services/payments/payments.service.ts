import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './schema/payments.schema';
import mongoose, { Model } from 'mongoose';
import { Request } from 'express';
import { update } from 'src/core/helper/query-helper';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { Currency, PaymentStatus } from 'src/common/enum';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
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
    private mailchimpService: MailChimpService,
  ) { }

  async createPayment(insertField:any) {
    return await this.PaymentModel.create(insertField);
  }

  async generateLink(
    amount: number,
    currency: Currency,
    purpose: PaymentPurpose,
    id: [mongoose.Types.ObjectId] | mongoose.Types.ObjectId,
    customerEmail?: string,
    customerName?: string,
  ) {
    const payPlusResponse = await axios.post(
      `${this.configService.paymentDetails.URL}PaymentPages/generatelink`,
      {
        payment_page_uid: this.configService.paymentDetails.PAGE_UUID,
        amount,
        currency_code: currency,
        refURL_success: `${this.configService.paymentDetails.SERVER_URL}${this.configService.paymentDetails.SUCCESS}`,
        refURL_failure: `${this.configService.paymentDetails.SERVER_URL}${this.configService.paymentDetails.FAILURE}`,
        more_info: `${purpose} | ${customerEmail} | ${customerName}`,
      },
      {
        headers: {
          ContentType: 'application/json',
          Authorization: `{"api_key": "${this.configService.paymentDetails.API}","secret_key": "${this.configService.paymentDetails.SECRET}"}`,
        },
      },
    );
    let insertField : any = {
      purpose,
      amount,
      currency,
      paymentRequestId: payPlusResponse.data.data.page_request_uid,
    };
    if (purpose === PaymentPurpose.VOUCHER) {
      insertField = {
        ...insertField,
        voucherId: id,
      };
    }

    if (purpose === PaymentPurpose.ORDER) {
      insertField = {
        ...insertField,
        orderId: id,
      };
    }

    if (payPlusResponse.data.results.status === 'success') {
      await this.createPayment(insertField);
    }

    return payPlusResponse.data;
  }

  async paymentSucess(request: Request) {
    const requestBody = request.body;
    const [purpose, email, name] = requestBody?.more_info?.split(' | ');

    const pageRequestUid = requestBody?.page_request_uid;

    const updateField = {
      customerName: requestBody?.customer_name,
      identificationNumber: requestBody?.identification_number,
      customerEmail: requestBody?.customer_email,
      method: requestBody?.method,
      status: PaymentStatus.SUCCESS,
    };
    const payments = await update<Payment>(
      this.PaymentModel,
      'paymentRequestId',
      pageRequestUid,
      updateField,
    );

    await this.mailchimpService.sendTransactionalEmail({
      subject: 'Payment Success | Order - MetGo',
      to: email,
      text: `Dear ${name}, Your payment has been successfully received.`,
    });
    if (purpose === PaymentPurpose.VOUCHER) {
      await this.voucherService.update(payments.voucherId, { paymentStatus: PaymentStatus.SUCCESS });
    }
    if (purpose === PaymentPurpose.ORDER) {
      await this.ordersService.updateOrderAfterPayment(payments.orderId);
      await this.mailchimpService.sendTransactionalEmail({
        subject: 'Order Confirmed - MetGo',
        to: requestBody.more_info.email,
        text: `Dear ${name}, Your order has been placed successfully.`,
      });
    }
  }

  PaymentFailure() {}
}
