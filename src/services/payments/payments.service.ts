import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Request } from 'express';
import mongoose, { Model } from 'mongoose';

import { Currency, PaymentStatus } from 'src/common/enum';
import { update } from 'src/core/helper/query-helper';
import { BusinessService } from 'src/modules/business/business.service';
import { OrdersService } from 'src/modules/orders/orders.services';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { ConfigService } from 'src/services/config/config.service';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import { PaymentPurpose } from 'src/services/payments/payments.type';
import { Payment } from 'src/services/payments/schema/payments.schema';

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
    private readonly businessService: BusinessService,
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
        more_info: purpose,
        more_info_1: customerEmail,
        more_info_2: customerName,
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

    const pageRequestUid = requestBody?.page_request_uid;

    const updateField = {
      customerName: requestBody?.customer_name,
      identificationNumber: requestBody?.identification_number,
      customerEmail: requestBody?.more_info_1,
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
      to: requestBody?.more_info_1,
      text: `Dear ${requestBody?.more_info_2}, Your payment has been successfully received.`,
    });
    if (requestBody?.more_info === PaymentPurpose.VOUCHER) {
      await this.voucherService.update(payments.voucherId, { paymentStatus: PaymentStatus.SUCCESS });
    }
    if (requestBody?.more_info === PaymentPurpose.ORDER) {
      const updateOrder = await this.ordersService.updateOrderAfterPayment(payments.orderId);

      await this.mailchimpService.sendTransactionalEmail({
        subject: 'Order Confirmed - MetGo',
        to: updateOrder.email,
        text: `Dear ${updateOrder.firstName}, Your order has been placed successfully.`,
      });
      // SEND TO BUSINESS OWNER
      const businessEmails = await this.businessService.findBusinessEmailByIds(updateOrder.businessId);

      await Promise.all(businessEmails.map(async business => {
        if (!business?.busiEmail) return;
        await this.mailchimpService.sendTransactionalEmail({
          subject: 'Order Confirmed - MetGo',
          to: business.busiEmail,
          text: 'Dear Business, Your product from business has been placed successfully.',
        });
      }));
    }
  }

  PaymentFailure() {}
}
