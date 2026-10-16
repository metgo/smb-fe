import {
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { GaMeasurementService } from 'src/modules/ga-measurement/ga-measurement.service';

import { Locale, PaymentStatus, VoucherPaymentStatus } from 'src/common/enum';
import { EnglishTemplate } from 'src/common/mailchimp/templateId';
import { exceptionHandling } from 'src/common/utils/exception-handling';
import { update, updateById } from 'src/core/helper/query-helper';

import { ConfigService } from '../config/config.service';
import { OrdersService } from 'src/modules/orders/orders.services';
import { VoucherService } from 'src/modules/vouchers/voucher.service';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';
import {
  GenerateLinkCommand,
  InvoiceCommand,
  PaymentPurpose,
} from 'src/services/payments/payments.type';
import { Payment } from 'src/services/payments/schema/payments.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel('Payment')
    private readonly PaymentModel: Model<Payment>,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => VoucherService))
    private readonly voucherService: VoucherService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private mailchimpService: MailChimpService,
    private readonly gaMeasurement: GaMeasurementService,
  ) {}

  async createPayment(insertField: any) {
    try {
      const payment = await this.PaymentModel.create(insertField);
      this.logger.info('[PAYMENT]: CREATED', {
        message: payment,
      });

      return payment;
    } catch (err) {
      this.logger.error('[PAYMENT]: FAILED TO CREATE', {
        err: err instanceof Error ? err.message : String(err),
      });
      exceptionHandling(err);
    }
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    try {
      const payment = await this.PaymentModel.findOne({ orderId });

      return payment;
    } catch (err) {
      exceptionHandling(err);
    }
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

    const { BE } = this.configService.baseUrl;
    const isMockPayment
      = this.configService.get('MOCK_CARDCOM_PAYMENT') === 'true';

    try {
      let cardComResponse;

      if (isMockPayment) {
        this.logger.info('[CARDCOM]: Using mock payment mode');
        cardComResponse = {
          data: {
            ResponseCode: 0,
            Description: 'OK',
            LowProfileId: `MOCK_${Date.now()}`,
            Url: `${BE}payment/success?LowProfileId=MOCK_${Date.now()}&languagePreference=${languagePreference}`,
          },
        };
      } else {
        cardComResponse = await axios.post(
          URL,
          {
            TerminalNumber: TERMINAL_NUMBER,
            ApiName: API_NAME,
            Amount: amount,
            ISOCoinId: 1,
            SuccessRedirectUrl: `${BE}${SUCCESS}?languagePreference=${languagePreference}`,
            FailedRedirectUrl: `${BE}${FAILURE}?languagePreference=${languagePreference}`,
            WebHookUrl: `${BE}${INDICATOR}?languagePreference=${languagePreference}`,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      }

      this.logger.info(`[CARDCOM-REQUST]: ${cardComResponse}`);

      if (!cardComResponse?.data?.LowProfileId) {
        this.logger.error(
          '[CARDCOM]: No LowProfileId received after cardcom api was hit ',
        );
        throw new ConflictException('Failed to receive link from cardcom');
      }
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
    } catch (err) {
      this.logger.error('[CARDCOM]: FAILED TO GENERATE LINK', {
        err: err instanceof Error ? err.message : String(err),
      });

      const ENV_NAME = this.configService.get('ENV_NAME');

      if (ENV_NAME === 'prod') {
        await this.mailchimpService.sendTransactionalEmail({
          to: 'barak@metgo.app',
          templatedId: EnglishTemplate.OrderFailAlert,
          mergeVars: {
            BUYERNAME: customerName,
            BUYEREMAIL: customerEmail,
            PURPOSE: purpose.toLowerCase(),
          },
        });
      }
      exceptionHandling(err);
    }
  }

  // Polled by the customer sites while the Cardcom iframe is open: Cardcom's
  // redirect to this BE can't render inside the iframe (Caddy sends
  // X-Frame-Options: DENY), so the FE closes the modal once this flips.
  async getPaymentStatus(paymentRequestId: string) {
    const payment = await this.PaymentModel.findOne(
      { paymentRequestId },
      { status: 1 },
    ).lean();

    return payment?.status ?? null;
  }

  async paymentSucess(query, languagePreference) {
    try {
      const paymentRequestId = query?.LowProfileId || query?.lowprofilecode;

      const existingPayment = await this.PaymentModel.findOne({
        paymentRequestId,
      });

      // Handle mock payments - if payment doesn't exist, create it as success
      if (!existingPayment) {
        this.logger.info(
          '[PAYMENT]: Mock payment success - no payment record found',
        );
        return;
      }

      if (existingPayment.status === PaymentStatus.SUCCESS) {
        this.logger.info(
          '[PAYMENT]: Payment already processed, skipping duplicate',
          {
            paymentRequestId,
            orderId: existingPayment.orderId,
          },
        );
        return;
      }

      const updateField = {
        status: PaymentStatus.SUCCESS,
        updatedAt: new Date(),
        paymentDate: new Date(),
      };
      const payments = await update<Payment>(
        this.PaymentModel,
        'paymentRequestId',
        paymentRequestId,
        updateField,
      );

      this.logger.info(
        `[PAYMENT]: UPDATED AFTER PAID SUCCESSFULLY >> payments: ${payments}`,
      );

      // await this.mailchimpService.sendTransactionalEmail({
      //   to: payments?.customerEmail,
      //   templatedId:
      //     languagePreference === Locale.ENGLISH
      //       ? EnglishTemplate.PaymentSuccessful
      //       : HebrewTemplate.PaymentSuccessful,
      //   mergeVars: {
      //     BUYERNAME: payments?.customerName,
      //     TOTALAMOUNT: payments?.amount,
      //   },
      // });

      // Skip invoice generation for mock payments (localhost testing)
      // const isMockPayment = paymentRequestId?.startsWith('MOCK_');

      if (payments?.purpose === PaymentPurpose.VOUCHER) {
        const voucherDetails
          = await this.voucherService.updateAfterPaymentSuccess({
            ids: payments.voucherId,
            updateField: { paymentStatus: VoucherPaymentStatus.PAID },
            languagePreference,
          });

        // if (!isMockPayment) {
        const invoiceDetail = await this.sendInvoice({
          customerName: payments?.customerName,
          customerEmail: payments?.customerEmail,
          invoiceType: 3,
          voucherDetails,
          transactionId: paymentRequestId,
          purpose: PaymentPurpose.VOUCHER,
          sumPaid: payments?.amount,
          languagePreference,
          additionalInformation: '',
        });

        if (invoiceDetail?.InvoiceLink) {
          await updateById<Payment>(this.PaymentModel, payments._id, {
            invoiceURL: invoiceDetail.InvoiceLink,
          });

          if (invoiceDetail?.InvoiceLink) {
            await updateById<Payment>(this.PaymentModel, payments._id, {
              invoiceURL: invoiceDetail.InvoiceLink,
            });
          }
        }
      }
      // }

      if (payments?.purpose === PaymentPurpose.ORDER) {
        let updateOrder;
        let getProductInformation;
        try {
          const result = await this.ordersService.updateAfterPaymentSuccess(
            payments.orderId,
            languagePreference,
          );
          updateOrder = result.updateOrder;
          getProductInformation = result.getProductInformation;
          // GA4 purchase from the server - fire and forget, never blocks
          // the payment flow
          this.gaMeasurement.sendPurchase(payments.orderId).catch(() => undefined);
        } catch (orderError) {
          this.logger.error(
            '[PAYMENT]: FAILED TO UPDATE ORDER AFTER PAYMENT SUCCESS',
            {
              orderId: payments.orderId,
              error:
                orderError instanceof Error
                  ? orderError.message
                  : String(orderError),
            },
          );
          // Don't throw - payment was successful, just log the issue
          return;
        }

        if (updateOrder?.totalAmount === updateOrder?.creditCardPayment) {
          // if (!isMockPayment) {
          const invoiceDetail = await this.sendInvoice({
            customerName: payments?.customerName,
            customerEmail: payments?.customerEmail,
            invoiceType: 101,
            product: [
              {
                id: getProductInformation[0]?._id?.toString(),
                price: payments?.amount,
                name: getProductInformation[0]?.name,
              },
            ],
            transactionId: paymentRequestId,
            purpose: PaymentPurpose.ORDER,
            sumPaid: payments?.amount,
            languagePreference,
            additionalInformation: 'Paid via Credit Card',
          });

          if (invoiceDetail?.InvoiceLink) {
            await updateById<Payment>(this.PaymentModel, payments._id, {
              invoiceURL: invoiceDetail.InvoiceLink,
            });

            if (invoiceDetail?.InvoiceLink) {
              await updateById<Payment>(this.PaymentModel, payments._id, {
                invoiceURL: invoiceDetail.InvoiceLink,
              });
            }
          }
        }
        // }

        if (updateOrder?.totalAmount !== updateOrder?.creditCardPayment) {
          const product = [
            {
              id: getProductInformation[0]?._id?.toString(),
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

          // if (!isMockPayment) {
          const invoiceDetail = await this.sendInvoice({
            customerName: payments?.customerName,
            customerEmail: payments?.customerEmail,
            invoiceType: 101,
            product,
            transactionId: paymentRequestId,
            purpose: PaymentPurpose.ORDER,
            sumPaid: updateOrder?.totalAmount,
            languagePreference,
            additionalInformation: 'Paid via Voucher and Credit Card',
          });

          if (invoiceDetail?.InvoiceLink) {
            await updateById<Payment>(this.PaymentModel, payments._id, {
              invoiceURL: invoiceDetail.InvoiceLink,
            });

            if (invoiceDetail?.InvoiceLink) {
              await updateById<Payment>(this.PaymentModel, payments._id, {
                invoiceURL: invoiceDetail.InvoiceLink,
              });
            }
          }
        }
      }
      // }
    } catch (err) {
      this.logger.error(
        `[PAYMENT]: PAYMENT FAILED >> err: ${
          err instanceof Error ? err.message : String(err)
        }`,
        {
          err: err instanceof Error ? err.message : String(err),
        },
      );
      exceptionHandling(err);
    }
  }

  async PaymentFailure(query, reason: string = 'card_payment_declined') {
    try {
      const pageRequestUid = query?.LowProfileId;

      const existingPayment = await this.PaymentModel.findOne({
        paymentRequestId: pageRequestUid,
      });

      // A late/duplicate failure webhook must not clobber a payment that a
      // success webhook already settled — mirrors the guard in paymentSucess().
      if (existingPayment?.status === PaymentStatus.SUCCESS) {
        this.logger.info(
          '[PAYMENT]: Ignoring stale failure webhook — payment already succeeded',
          {
            paymentRequestId: pageRequestUid,
            orderId: existingPayment.orderId,
          },
        );
        return;
      }

      // Already failed (e.g. Cardcom's webhook beat the customer's own close
      // button here, or vice versa) - don't re-run side effects twice.
      if (existingPayment?.status === PaymentStatus.FAILURE) {
        this.logger.info(
          '[PAYMENT]: Ignoring duplicate failure trigger — already failed',
          {
            paymentRequestId: pageRequestUid,
            orderId: existingPayment.orderId,
          },
        );
        return;
      }

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

      this.logger.info('[PAYMENT]: UPDATED AFTER PAID FAILED', {
        message: payments,
      });

      if (payments?.purpose === PaymentPurpose.VOUCHER) {
        await this.voucherService.updateAfterPaymentFailure({
          ids: payments.voucherId,
          updateField: { paymentStatus: VoucherPaymentStatus.FAILED },
          languagePreference: query?.languagePreference,
        });
      }

      if (payments?.purpose === PaymentPurpose.ORDER) {
        // GA4 payment_failed from the server - fire and forget
        this.gaMeasurement.sendPaymentFailed(payments.orderId, reason).catch(() => undefined);
        await this.ordersService.updateAfterPaymentFailure(
          payments.orderId,
          reason,
        );
      }
    } catch (err) {
      this.logger.error(
        '[PAYMENT]: FAILED TO UPDATE PAYMENT AFTER PAYMENT FAILURE',
        {
          err: err instanceof Error ? err.message : String(err),
        },
      );
      exceptionHandling(err);
    }
  }

  // Called by the FE the instant a customer explicitly closes the Cardcom
  // payment modal/iframe (not a tab close - that sends nothing at all, see
  // handlePaymentModalClose in Travel-FE/MarketplaceV2-FE). Gives a genuine
  // "cancelled by the customer" signal instead of waiting on Cardcom's own
  // webhook or the 15-minute expiry cron to eventually resolve it.
  async cancelPaymentByUser(paymentRequestId: string) {
    return this.PaymentFailure(
      { LowProfileId: paymentRequestId },
      'cancelled_by_customer',
    );
  }

  async sendInvoice(command: InvoiceCommand) {
    const { API_NAME, API_PASSWORD, INVOICE_URL } = this.configService.cardCom;

    const invoiceLines = [];
    if (command?.purpose === PaymentPurpose.VOUCHER) {
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
    if (command?.purpose === PaymentPurpose.ORDER) {
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

    try {
      const response = await axios.post(INVOICE_URL, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (err) {
      this.logger.error('[CARDCOM]: Error while requesting invoice');

      const ENV_NAME = this.configService.get('ENV_NAME');
      if (ENV_NAME === 'prod') {
        await this.mailchimpService.sendTransactionalEmail({
          to: 'barak@metgo.app',
          templatedId: EnglishTemplate.OrderFailAlert,
          mergeVars: {
            BUYERNAME: command.customerName,
            BUYEREMAIL: command.customerEmail,
            PURPOSE: command?.purpose?.toLowerCase(),
          },
        });
      }
      exceptionHandling(err);
    }
  }

  // async startOrderPaymentProcess(
  //   command: OrderPaymentDto,
  //   loggedInUser?: LoggedInUserInterface,
  // ) {
  //   try {
  //     const orderInfo: any = await this.ordersService.findOneByIdAndPopulate(
  //       command?.orderId,
  //     );
  //     const existPayment = await this.findByOrderId(command.orderId);

  //     if (existPayment) {
  //       throw new ForbiddenException('Multiple payment process');
  //     }

  //     if (orderInfo?.externalApiId?.identifierId !== command.identifierId) {
  //       this.logger.error(
  //         `[PAYMENT]: FAILED TO START PAYMENT PROCESS IN ${command.identifierId}, wrong identifierId`,
  //       );
  //       throw new ForbiddenException('You cannot process for checkout');
  //     }

  //     const payment = await this.PaymentModel.create({
  //       ...command,
  //       purpose: PaymentPurpose.ORDER,
  //       currency: 'ILS',
  //       customerName: command?.customerName || orderInfo?.firstName,
  //       customerEmail: command?.customerEmail || orderInfo?.email,
  //       paymentRequestId: command.lowProfileId,
  //       status: PaymentStatus.PENDING,
  //       createdBy: loggedInUser?.id,
  //       createdAt: new Date(),
  //     });

  //     // update order
  //     await this.ordersService.updatePostPaymentStart(
  //       command.orderId,
  //       {
  //         paymentMode: orderInfo?.voucher?.length
  //           ? [PaymentMode.VOUCHER, PaymentMode.CARD]
  //           : [PaymentMode.CARD],
  //         creditCardPayment: command.amount,
  //       },
  //       loggedInUser?.id,
  //     );
  //     this.logger.info(
  //       `[${command.identifierId}-PAYMENT]: ORDER PAYMENT PROCESS STARTED`,
  //       {
  //         message: payment,
  //       },
  //     );

  //     return payment;
  //   } catch (err) {
  //     this.logger.error(
  //       `[${command.identifierId}-PAYMENT]: FAILED TO START ORDER PAYMENT PROCESS`,
  //       {
  //         err: err.message,
  //       },
  //     );
  //     exceptionHandling(err);
  //   }
  // }

  // async updateOrderPaymentProcess(
  //   pageRequestUid: string,
  //   body: UpdatePaymentProcessDto,
  //   loggedInUser?: LoggedInUserInterface,
  // ) {
  //   try {
  //     if (body.status === PaymentStatus.FAILURE && !body?.failure_reason) {
  //       throw new BadRequestException('Please provide a valid failure reason');
  //     }
  //     const updateField = {
  //       ...body,
  //       updatedAt: new Date(),
  //       paymentDate: new Date(),
  //       updatedBy: loggedInUser?.id,
  //     };
  //     const payments = await update<Payment>(
  //       this.PaymentModel,
  //       'paymentRequestId',
  //       pageRequestUid,
  //       updateField,
  //     );

  //     // if payment success
  //     if (body?.status === PaymentStatus.SUCCESS) {
  //       const updateOrder
  //         = await this.ordersService.updateOrderPostSuccessPayment(
  //           payments?.orderId,
  //           loggedInUser,
  //         );

  //       // remove the freeze vouchers
  //       if (updateOrder?.voucher && updateOrder?.voucher?.length) {
  //         await this.voucherService.deleteFreezeVouchersPostSuccess(
  //           updateOrder.voucher,
  //           payments?.orderId,
  //           loggedInUser,
  //         );
  //       }

  //       // remove product freeze quantity
  //       await this.productsService.deleteFreezeProductPostSuccess(
  //         updateOrder.products,
  //         payments?.orderId,
  //         loggedInUser,
  //       );
  //     }

  //     // if payment failure
  //     if (body?.status === PaymentStatus.FAILURE) {
  //       const updateOrder
  //         = await this.ordersService.updateOrderPostFailurePayment(
  //           payments?.orderId,
  //           loggedInUser,
  //         );

  //       if (updateOrder?.voucher && updateOrder?.voucher?.length) {
  //         await this.voucherService.reimburseFreezeVouchersPostFailure(
  //           updateOrder.voucher,
  //           payments?.orderId,
  //           loggedInUser,
  //         );
  //       }

  //       // reimburse product quantity

  //       await this.productsService.reimburseFreezeProductsPostFailure(
  //         updateOrder.products,
  //         payments?.orderId,
  //         loggedInUser,
  //       );
  //     }

  //     return payments;
  //   } catch (err) {
  //     this.logger.error(
  //       `[EXTERNAL API]: PAYMENT STATUS UPDATED >> err: ${err.message}`,
  //       {
  //         err: err.message,
  //       },
  //     );
  //     exceptionHandling(err);
  //   }
  // }

  // async startVoucherPaymentProcess(
  //   command: VoucherPaymentDto,
  //   loggedInUser?: LoggedInUserInterface,
  // ) {
  //   try {
  //     const voucherInfo: any = await this.voucherService.findByIds(
  //       command.voucherId,
  //     );

  //     const existPayment = await this.findByVoucherId(command.voucherId);

  //     if (existPayment) {
  //       throw new ForbiddenException('Multiple payment process');
  //     }

  //     await Promise.all(
  //       voucherInfo?.map(async voucher => {
  //         if (voucher?.externalApiId?.identifierId !== command.identifierId) {
  //           this.logger.error(
  //             `[${command.identifierId} - PAYMENT]: FAILED TO START PAYMENT PROCESS-wrong identifierId`,
  //           );
  //           throw new ForbiddenException('You cannot process for checkout');
  //         }
  //       }),
  //     );

  //     const payment = await this.PaymentModel.create({
  //       ...command,
  //       purpose: PaymentPurpose.VOUCHER,
  //       currency: 'ILS',
  //       paymentRequestId: command.lowProfileId,
  //       status: PaymentStatus.PENDING,
  //       createdBy: loggedInUser?.id,
  //       createdAt: new Date(),
  //     });

  //     this.logger.info(
  //       `[${command.identifierId}-PAYMENT]: VOUCHER PAYMENT PROCESS STARTED`,
  //       {
  //         message: payment,
  //       },
  //     );

  //     return payment;
  //   } catch (err) {
  //     this.logger.error(
  //       `[${command.identifierId}-PAYMENT]: FAILED TO START VOUCHER PAYMENT PROCESS`,
  //       {
  //         err: err.message,
  //       },
  //     );
  //     exceptionHandling(err);
  //   }
  // }

  // async updateVoucherPaymentProcess(
  //   pageRequestUid: string,
  //   body: UpdatePaymentProcessDto,
  //   loggedInUser?: LoggedInUserInterface,
  // ) {
  //   try {
  //     if (body.status === PaymentStatus.FAILURE && !body?.failure_reason) {
  //       throw new BadRequestException('Please provide a valid failure reason');
  //     }
  //     const updateField = {
  //       ...body,
  //       updatedAt: new Date(),
  //       paymentDate: new Date(),
  //       updatedBy: loggedInUser?.id,
  //     };
  //     const payments = await update<Payment>(
  //       this.PaymentModel,
  //       'paymentRequestId',
  //       pageRequestUid,
  //       updateField,
  //     );

  //     // if payment success

  //     await this.voucherService.updateVoucherPostPaymentUpdate(
  //       payments?.voucherId,
  //       body.status === PaymentStatus.SUCCESS
  //         ? VoucherPaymentStatus.PAID
  //         : VoucherPaymentStatus.FAILED,
  //       loggedInUser,
  //     );
  //     return payments;
  //   } catch (err) {
  //     this.logger.error(
  //       `[EXTERNAL API]: FAILED WHILE PAYING FOR VOUCHER - ${pageRequestUid} >> err: ${err.message}`,
  //       {
  //         err: err.message,
  //       },
  //     );
  //     exceptionHandling(err);
  //   }
  // }

  // async findByOrderId(orderId: string) {
  //   try {
  //     const payment = await this.PaymentModel.findOne({ orderId });

  //     return payment;
  //   } catch (err) {
  //     exceptionHandling(err);
  //   }
  // }

  // async findByVoucherId(voucherId: string[]) {
  //   try {
  //     const payment = await this.PaymentModel.findOne({ voucherId });

  //     return payment;
  //   } catch (err) {
  //     exceptionHandling(err);
  //   }
  // }
}
