import { Logger } from 'winston';

import { DynamicEmailTemplate } from 'src/common/mailchimp/templateId';
import { ConfigService } from 'src/services/config/config.service';
import { MailChimpService } from 'src/services/mailchimp/mailchimp.service';

import { ExternalApiServices } from 'src/modules/external-api/external-api.service';
import { Order } from 'src/modules/orders/schema/orders.schema';
import { PaymentMode } from 'src/modules/orders/orders.type';

export const HIGH_VALUE_ORDER_THRESHOLD_ILS = 3000;

export const HIGH_VALUE_ORDER_ALERT_RECIPIENTS = [
  'tzlil@metgo.app',
  'barak@metgo.app',
];

/**
 * Local/staging testing hook. Set to your email to test: while non-empty the
 * alert is sent ONLY to this address and the production gate is bypassed, so it
 * fires on local/staging too. MUST stay '' (empty) in production so
 * HIGH_VALUE_ORDER_ALERT_RECIPIENTS (CEO + CTO) receive the mail.
 */
export const HIGH_VALUE_ORDER_ALERT_TEST_EMAIL = '';

interface HighValueOrderAlertDeps {
  mailchimpService: MailChimpService;
  configService: ConfigService;
  externalApiService: ExternalApiServices;
  logger: Logger;
}

/**
 * Fire-and-forget alert for a paid order above the threshold. Never throws -
 * an alert failure must not break checkout. Call it once per checkout, right
 * after the order reaches paymentStatus = SUCCESS.
 *
 * Covers every settlement path (card, card + voucher, voucher-only,
 * mini-site, event tickets). Multi-vendor checkouts create one parent order
 * plus N child orders; the parent carries the full amount, so children
 * (parentOrderId set) are skipped to avoid duplicate alerts.
 */
export async function notifyHighValueOrder(
  order: Order,
  deps: HighValueOrderAlertDeps,
): Promise<void> {
  const {
    mailchimpService,
    configService,
    externalApiService,
    logger,
  } = deps;

  try {
    if (!order) return;

    // Child of a vendor split - the parent already triggered the alert.
    if (order.parentOrderId) return;

    const amount = Number(order.totalAmount) || 0;
    if (amount <= HIGH_VALUE_ORDER_THRESHOLD_ILS) return;

    // Local/staging testing: when HIGH_VALUE_ORDER_ALERT_TEST_EMAIL is set the
    // alert is sent ONLY to that address and the prod gate is bypassed. Keep it
    // '' in production so the real recipients get the mail.
    const testRecipient = HIGH_VALUE_ORDER_ALERT_TEST_EMAIL.trim();

    // Match the existing internal-alert convention: prod only.
    if (!testRecipient && configService.get('ENV_NAME') !== 'prod') {
      logger.info('[HIGH_VALUE_ORDER]: ALERT SKIPPED (non-prod)', {
        orderId: order._id?.toString(),
        amount,
      });
      return;
    }

    const recipients = testRecipient
      ? [testRecipient]
      : HIGH_VALUE_ORDER_ALERT_RECIPIENTS;

    // Which customer-facing site the order came from (multi-tenant).
    let siteName = '';
    let siteUrl = '';
    try {
      if (order.externalApiId) {
        const site: any = await externalApiService.getById(
          order.externalApiId.toString(),
        );
        siteName = site?.name
          || site?.websiteNameEn
          || site?.websiteNameHe
          || site?.websiteNameAr
          || site?.identifierId
          || '';
        siteUrl = site?.websiteUrl || '';
      }
    } catch (siteError) {
      logger.warn('[HIGH_VALUE_ORDER]: FAILED TO RESOLVE SITE', {
        orderId: order._id?.toString(),
        err: siteError instanceof Error ? siteError.message : String(siteError),
      });
    }

    const paymentModeLabels: Record<string, string> = {
      [PaymentMode.CARD]: 'כרטיס אשראי',
      [PaymentMode.VOUCHER]: 'שובר',
    };
    const paymentModes = Array.isArray(order.paymentMode)
      ? order.paymentMode
      : [order.paymentMode || PaymentMode.CARD];
    const paymentMode = paymentModes
      .map(mode => paymentModeLabels[mode] || mode)
      .join(' + ');

    // When an order is settled by card AND voucher, show how much came from
    // each. voucher[].redeemedAmount is the shekel value taken off per voucher;
    // creditCardPayment is what was charged to the card after that.
    const voucherAmount = Array.isArray(order.voucher)
      ? order.voucher.reduce(
        (sum, v) => sum + (Number(v?.redeemedAmount) || 0),
        0,
      )
      : 0;
    const voucherCount = Array.isArray(order.voucher) ? order.voucher.length : 0;
    const cardAmount = Number(order.creditCardPayment) || 0;
    const isSplitPayment = voucherAmount > 0 && cardAmount > 0;

    const voucherLabel = voucherCount === 1
      ? 'בשובר'
      : `ב-${voucherCount} שוברים`;
    const paymentBreakdownHtml = isSplitPayment
      ? `<div style="font-size: 13px; color: #5b6b7c; margin-top: 4px;">₪${cardAmount.toLocaleString('en-US')} בכרטיס אשראי &nbsp;+&nbsp; ₪${voucherAmount.toLocaleString('en-US')} ${voucherLabel}</div>`
      : '';

    const buyerName = [order.firstName, order.lastName]
      .filter(Boolean)
      .join(' ');

    const buyerPhone = order.phone
      ? `${order.countryCode || ''}${order.phone}`
      : '';

    const formattedAmount = amount.toLocaleString('en-US');
    const subject = siteName
      ? `הזמנה בסכום גבוה – ₪${formattedAmount} · ${siteName}`
      : `הזמנה בסכום גבוה – ₪${formattedAmount}`;

    const orderDate = order.paymentDate || new Date();
    const formattedDate = orderDate.toLocaleString('he-IL', {
      timeZone: 'Asia/Jerusalem',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const mergeVars = {
      ORDER_ID: order._id?.toString() || '',
      ORDER_AMOUNT: formattedAmount,
      THRESHOLD: HIGH_VALUE_ORDER_THRESHOLD_ILS.toLocaleString('en-US'),
      PAYMENT_MODE: paymentMode,
      PAYMENT_BREAKDOWN_HTML: paymentBreakdownHtml,
      SITE_NAME: siteName,
      SITE_URL: siteUrl,
      BUYER_NAME: buyerName,
      BUYER_EMAIL: order.email || '',
      BUYER_PHONE: buyerPhone,
      ORDER_DATE: formattedDate,
      // ORDER_LINK: `https://workspace.metgo.app/orders/${order._id?.toString()}`,
      ORDER_LINK: 'https://workspace.metgo.app/orders-management',
    };

    await Promise.all(
      recipients.map(to => mailchimpService.sendTransactionalEmail({
        to,
        templatedId: DynamicEmailTemplate.HighValueOrderAlert,
        subject,
        mergeVars,
      })),
    );

    logger.info('[HIGH_VALUE_ORDER]: ALERT SENT', {
      orderId: order._id?.toString(),
      amount,
      siteName,
      recipients,
      test: Boolean(testRecipient),
    });
  } catch (error) {
    logger.error('[HIGH_VALUE_ORDER]: FAILED TO SEND ALERT', {
      orderId: order?._id?.toString(),
      err: error instanceof Error ? error.message : String(error),
    });
  }
}
