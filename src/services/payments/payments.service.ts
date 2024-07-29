import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';

import { Locale, PaymentStatus, VoucherPaymentStatus } from 'src/common/enum';
import {
  EnglishTemplate,
  HebrewTemplate,
} from 'src/common/mailchimp/templateId';
import { ConfigService } from '../config/config.service';
import { Payment } from './schema/payments.schema';
import { update, updateById } from 'src/core/helper/query-helper';
import { BusinessService } from 'src/modules/business/services/business.service';
import { OrdersService } from 'src/modules/orders/orders.services';
import { ProductsService } from 'src/modules/products/products.services';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import {
  GenerateLinkCommand,
  InvoiceCommand,
  PaymentPurpose,
} from 'src/services/payments/payments.type';

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
    private readonly productsService: ProductsService,
  ) {}

  async createPayment(insertField: any) {
    return await this.PaymentModel.create(insertField);
  }

  async generateLink(command: GenerateLinkCommand) {
    const {
      amount,
      currency,
      purpose,
      id,
      languagePreference,
      customerEmail,
      customerName,
    } = command;
    const {
      URL, TERMINAL_NUMBER, API_NAME, SUCCESS, FAILURE, INDICATOR,
    }
      = this.configService.cardCom;

    const cardComResponse = await axios.post(
      URL,
      {
        TerminalNumber: TERMINAL_NUMBER,
        ApiName: API_NAME,
        Amount: amount,
        ISOCoinId: 1,
        SuccessRedirectUrl: `${this.configService.baseUrl}${SUCCESS}?languagePreference=${languagePreference}`,
        FailedRedirectUrl: `${this.configService.baseUrl}${FAILURE}?languagePreference=${languagePreference}`,
        WebHookUrl: `${this.configService.baseUrl}${INDICATOR}?languagePreference=${languagePreference}`,
      },
      {
        headers: {
          ContentType: 'application/json',
        },
      },
    );

    let insertField: any = {
      purpose,
      amount,
      currency,
      customerName,
      customerEmail,
      paymentRequestId: cardComResponse.data.LowProfileId,
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

    if (
      cardComResponse.data.ResponseCode === 0
      && cardComResponse.data.Description === 'OK'
    ) {
      await this.createPayment(insertField);
    }

    return cardComResponse.data;
  }

  async paymentSucess(query) {
    const pageRequestUid = query?.lowprofilecode;

    const updateField = {
      status: PaymentStatus.SUCCESS,
      updatedAt: new Date(),
      paymentDate: new Date(),
    };
    const payments = await update<Payment>(
      this.PaymentModel,
      'paymentRequestId',
      pageRequestUid,
      updateField,
    );

    await this.mailchimpService.sendTransactionalEmail({
      to: payments?.customerEmail,
      templatedId:
        query?.languagePreference === Locale.HEBREW
          ? HebrewTemplate.PaymentSuccessful
          : EnglishTemplate.PaymentSuccessful,
      mergeVars: {
        BUYERNAME: payments?.customerName,
        TOTALAMOUNT: payments?.amount,
      },
    });

    if (payments.purpose === PaymentPurpose.VOUCHER) {
      const voucherDetails
        = await this.voucherService.updateAfterPaymentSuccess({
          ids: payments.voucherId,
          updateField: { paymentStatus: VoucherPaymentStatus.PAID },
          voucherOwnerEmail: payments?.customerEmail,
          voucherOwnerName: payments?.customerName,
          languagePreference: query?.languagePreference,
        });

      const invoiceDetail = await this.sendInvoice({
        customerName: payments?.customerName,
        customerEmail: payments?.customerEmail,
        invoiceType: 3,
        voucherDetails,
        transactionId: pageRequestUid,
        purpose: PaymentPurpose.VOUCHER,
        sumPaid: payments?.amount,
        languagePreference: query?.languagePreference,
        additionalInformation: '',
      });

      if (invoiceDetail?.InvoiceLink) {
        await updateById<Payment>(this.PaymentModel, payments._id, {
          invoiceURL: invoiceDetail.InvoiceLink,
        });
      }
    }

    if (payments.purpose === PaymentPurpose.ORDER) {
      const updateOrder = await this.ordersService.updateAfterPaymentSuccess(
        payments.orderId,
      );

      const [getProductInformation, businessDetails] = await Promise.all([
        this.productsService.getProductInformationForOrders(
          updateOrder.products,
        ),
        this.businessService.findBusinessEmailByIds(updateOrder.businessId),
      ]);

      await this.mailchimpService.sendTransactionalEmail({
        to: updateOrder?.email,
        templatedId:
          query?.languagePreference === Locale.HEBREW
            ? HebrewTemplate.OrderConfirmationForClient
            : EnglishTemplate.OrderConfirmationForClient,
        mergeVars: {
          BUYERNAME: updateOrder?.firstName,
          BUSINESSNAME: businessDetails[0]?.name || '',
          PRODUCTNAME: getProductInformation[0]?.name,
          QUANTITY: 1,
          COST: getProductInformation[0]?.price?.sellingPrice,
          TOTALAMOUNT: updateOrder?.totalAmount,
          BUSINESSPHONE:
            `${businessDetails[0]?.countryCode}-${businessDetails[0]?.phoneNumber}`
            || '',
          BUSINESSEMAIL: businessDetails[0]?.busiEmail || '',
          BUSINESSADDRESS: businessDetails[0]?.address?.location || '',
        },
      });

      if (updateOrder?.totalAmount === updateOrder?.creditCardPayment) {
        const invoiceDetail = await this.sendInvoice({
          customerName: payments?.customerName,
          customerEmail: payments?.customerEmail,
          invoiceType: 101,
          product: [
            {
              id: getProductInformation[0]?._id.toString(),
              price: payments?.amount,
              name: getProductInformation[0]?.name,
            },
          ],
          transactionId: pageRequestUid,
          purpose: PaymentPurpose.ORDER,
          sumPaid: payments?.amount,
          languagePreference: query?.languagePreference,
          additionalInformation: 'Paid via Credit Card',
        });

        if (invoiceDetail?.InvoiceLink) {
          await updateById<Payment>(this.PaymentModel, payments._id, {
            invoiceURL: invoiceDetail.InvoiceLink,
          });
        }
      }

      if (updateOrder?.totalAmount !== updateOrder?.creditCardPayment) {
        const product = [
          {
            id: getProductInformation[0]?._id.toString(),
            price: updateOrder?.creditCardPayment,
            name: getProductInformation[0]?.name,
          },
        ];

        if (updateOrder?.voucher?.length) {
          await Promise.all(
            updateOrder.voucher.map(async voucher => {
              const voucherDetails = await this.voucherService.getOneById(
                voucher.id,
              );
              product.push({
                id: voucherDetails.code,
                price: voucher.redeemedAmount,
                name: 'Amount Paid by voucher',
              });
            }),
          );
        }

        const invoiceDetail = await this.sendInvoice({
          customerName: payments?.customerName,
          customerEmail: payments?.customerEmail,
          invoiceType: 101,
          product,
          transactionId: pageRequestUid,
          purpose: PaymentPurpose.ORDER,
          sumPaid: updateOrder?.totalAmount,
          languagePreference: query?.languagePreference,
          additionalInformation: 'Paid via Voucher and Credit Card',
        });

        if (invoiceDetail?.InvoiceLink) {
          await updateById<Payment>(this.PaymentModel, payments._id, {
            invoiceURL: invoiceDetail.InvoiceLink,
          });
        }
      }

      // SEND TO BUSINESS OWNER

      await Promise.all(
        businessDetails.map(async business => {
          if (!business?.busiEmail) return;
          await this.mailchimpService.sendTransactionalEmail({
            to: business?.busiEmail,
            templatedId:
              query?.languagePreference === Locale.HEBREW
                ? HebrewTemplate.OrderReceivedForBusiness
                : EnglishTemplate.OrderReceivedForBusiness,
            mergeVars: {
              BUSINESSNAME: business?.name || '',
              PRODUCTNAME: getProductInformation[0]?.name,
              QUANTITY: 1,
              COST: getProductInformation[0]?.price?.sellingPrice,
              TOTALAMOUNT: updateOrder?.totalAmount,
              BUYERNAME: `${updateOrder?.firstName} ${updateOrder?.lastName}`,
              BUYERPHONE: `${updateOrder?.countryCode}-${updateOrder?.phone}`,
              BUYEREMAIL: updateOrder?.email,
              BUYERADDRESS: updateOrder?.address,
            },
          });
        }),
      );
    }
  }

  async PaymentFailure(query) {
    const pageRequestUid = query?.lowprofilecode;

    const updateField = {
      status: PaymentStatus.FAILURE,
      updatedAt: new Date(),
    };
    const payments = await update<Payment>(
      this.PaymentModel,
      'paymentRequestId',
      pageRequestUid,
      updateField,
    );

    if (payments.purpose === PaymentPurpose.VOUCHER) {
      await this.voucherService.updateAfterPaymentFailure({
        ids: payments.voucherId,
        updateField: { paymentStatus: VoucherPaymentStatus.FAILED },
        voucherOwnerEmail: payments?.customerEmail,
        voucherOwnerName: payments?.customerName,
        languagePreference: query?.languagePreference,
      });
    }

    if (payments.purpose === PaymentPurpose.ORDER) {
      await this.ordersService.updateAfterPaymentFailure(payments.orderId);
    }
  }

  async sendInvoice(command: InvoiceCommand) {
    const { API_NAME, API_PASSWORD, INVOICE_URL } = this.configService.cardCom;

    const invoiceLines = [];
    if (command.purpose === PaymentPurpose.VOUCHER) {
      command.voucherDetails.forEach(voucher => {
        invoiceLines.push({
          Description: voucher?.code,
          Quantity: 1,
          IsPriceIncludeVAT: true,
          IsVatFree: 'test vat',
          Price: voucher.amount,
          ProductID: voucher._id,
        });
      });
    }
    if (command.purpose === PaymentPurpose.ORDER) {
      command.product.forEach(product => {
        invoiceLines.push({
          Description: product?.name,
          Quantity: 1,
          IsPriceIncludeVAT: true,
          IsVatFree: 'test vat',
          Price: product.price,
          ProductID: product.id,
        });
      });
    }
    const body = {
      ApiName: API_NAME,
      ApiPassword: API_PASSWORD,
      InvoiceType: command.invoiceType,
      InvoiceHead: {
        CustName: command.customerName,
        Language: command?.languagePreference === Locale.HEBREW ? 'he' : 'en',
        CoinID: 0,
        Email: command.customerEmail,
        SendByEmail: true,
        ExtIsVatFree: true,
        DepartmentIdShort: 0,
        Comments: command.additionalInformation,
      },
      InvoiceLines: invoiceLines,
      CustomLines: [
        {
          TransactionID: command.transactionId,
          TranDate: new Date(),
          Sum: command.sumPaid,
        },
      ],
    };

    const response = await axios.post(INVOICE_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}
