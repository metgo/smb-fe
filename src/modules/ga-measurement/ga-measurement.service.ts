import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import axios from 'axios';
import mongoose, { Connection } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

const LOG = '[GA MEASUREMENT]';
const MP_URL = 'https://www.google-analytics.com/mp/collect';
const CURRENCY = 'ILS';
// GA4 client ids look like "123456789.1712345678"; session ids are digits
const CLIENT_ID_RE = /^\d{1,20}\.\d{1,20}$/;
const SESSION_ID_RE = /^\d{1,20}$/;

const oid = (id: unknown) => (mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(String(id)) : null);

interface GaItem {
  item_id: string;
  item_name: string;
  item_brand?: string;
  business_id?: string;
  price: number;
  quantity: number;
}

// Server-side GA4 events (Measurement Protocol) for checkout. The browser
// can't send `purchase` reliably - payment completes on Cardcom's page and
// the customer may never come back - so it is sent from here when Cardcom
// confirms the payment. The visitor's GA ids arrive as `x-ga-client-id` /
// `x-ga-session-id` headers when the order is placed and are kept per cart.
// Nothing is sent when there is no client id (no analytics consent), no
// "G-…" tracking id in site config, or no API secret for the site.
@Injectable()
export class GaMeasurementService implements OnModuleInit {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  private col(name: string) {
    return this.connection.collection(name);
  }

  // one row per cart; GA ids are only useful for a few weeks
  async onModuleInit() {
    try {
      await this.col('checkoutgasessions').createIndex({ cartId: 1 }, { unique: true });
      await this.col('checkoutgasessions').createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 30 * 24 * 60 * 60 },
      );
    } catch (err) {
      this.logger.warn(`${LOG} could not create indexes`, { err: (err as Error).message });
    }
  }

  // called when the order is placed - never throws
  async rememberCheckout(cartId: string | undefined, headers: Record<string, unknown>) {
    try {
      const clientId = String(headers?.['x-ga-client-id'] ?? '').trim();
      const sessionId = String(headers?.['x-ga-session-id'] ?? '').trim();
      const cart = oid(cartId);
      if (!cart || !CLIENT_ID_RE.test(clientId)) return;
      await this.col('checkoutgasessions').updateOne(
        { cartId: cart },
        {
          $set: {
            clientId,
            sessionId: SESSION_ID_RE.test(sessionId) ? sessionId : null,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date(), purchaseSentAt: null },
        },
        { upsert: true },
      );
    } catch (err) {
      this.logger.warn(`${LOG} could not store GA ids`, { cartId, err: (err as Error).message });
    }
  }

  private async siteCredentials(externalApiId: unknown) {
    const site = oid(externalApiId);
    if (!site) return null;
    const [config, secret] = await Promise.all([
      this.col('externalapis').findOne({ _id: site }, { projection: { googleAnalyticsId: 1 } }),
      this.col('siteanalyticssecrets').findOne({ externalApiId: site }),
    ]);
    const measurementId = String(config?.googleAnalyticsId ?? '').trim();
    if (!/^G-[A-Z0-9]+$/i.test(measurementId) || !secret?.gaApiSecret) return null;
    return { measurementId, apiSecret: String(secret.gaApiSecret) };
  }

  // order lines (including vendor-split child orders) as GA4 items
  private async orderItems(orderId: mongoose.Types.ObjectId): Promise<GaItem[]> {
    const children = await this.col('orders')
      .find({ parentOrderId: orderId })
      .project({ _id: 1 })
      .toArray();
    const lines = await this.col('orderproducts')
      .find({ orderId: { $in: [orderId, ...children.map(c => c._id)] }, isDeleted: { $ne: true } })
      .project({
        itemId: 1, itemType: 1, quantity: 1, amount: 1,
      })
      .toArray();
    if (!lines.length) return [];

    const ids = lines.map(l => l.itemId);
    const [products, tickets] = await Promise.all([
      this.col('products').find({ _id: { $in: ids } }).project({ name: 1, businessId: 1 }).toArray(),
      this.col('tickets').find({ _id: { $in: ids } }).project({ name: 1, eventId: 1 }).toArray(),
    ]);
    const events = await this.col('events')
      .find({ _id: { $in: tickets.map(t => t.eventId).filter(Boolean) } })
      .project({ name: 1, businessId: 1 })
      .toArray();
    const businessIds = [
      ...products.map(p => p.businessId),
      ...events.map(e => e.businessId),
    ].filter(Boolean);
    const businesses = await this.col('businesses')
      .find({ _id: { $in: businessIds } })
      .project({ name: 1, nameHe: 1 })
      .toArray();

    const productById = new Map(products.map(p => [String(p._id), p]));
    const ticketById = new Map(tickets.map(t => [String(t._id), t]));
    const eventById = new Map(events.map(e => [String(e._id), e]));
    const businessName = new Map(businesses.map(b => [String(b._id), b.nameHe || b.name || '']));

    return lines.map(line => {
      const product = productById.get(String(line.itemId));
      const ticket = ticketById.get(String(line.itemId));
      const event = ticket ? eventById.get(String(ticket.eventId)) : null;
      const businessId = product?.businessId ?? event?.businessId ?? null;
      return {
        item_id: String(line.itemId),
        item_name: product?.name || (ticket ? `${event?.name ?? ''} ${ticket.name ?? ''}`.trim() : '') || String(line.itemId),
        item_brand: businessId ? businessName.get(String(businessId)) || undefined : undefined,
        business_id: businessId ? String(businessId) : undefined,
        item_category: line.itemType,
        price: Number(line.amount) || 0,
        quantity: Number(line.quantity) || 1,
      } as GaItem;
    });
  }

  private async send(
    credentials: { measurementId: string; apiSecret: string },
    clientId: string,
    events: { name: string; params: Record<string, unknown> }[],
  ) {
    await axios.post(
      MP_URL,
      { client_id: clientId, events },
      {
        params: { measurement_id: credentials.measurementId, api_secret: credentials.apiSecret },
        timeout: 5000,
      },
    );
  }

  // called after Cardcom confirms the payment - never throws, sends once
  // cartId: pass it when the cart may not be linked to the order yet
  // (voucher-only orders)
  async sendPurchase(orderId: unknown, cartId?: unknown): Promise<void> {
    try {
      const order = oid(orderId) && await this.col('orders').findOne({ _id: oid(orderId)! });
      if (!order) return;
      const cart = (oid(cartId) ? { _id: oid(cartId)! } : null)
        ?? await this.col('carts').findOne({ orderId: order._id }, { projection: { _id: 1 } })
        ?? await this.col('carts').findOne({ orderId: String(order._id) }, { projection: { _id: 1 } });
      if (!cart) return;
      // claim the send first so duplicate Cardcom webhooks can't double count
      const session = await this.col('checkoutgasessions').findOneAndUpdate(
        { cartId: cart._id, purchaseSentAt: null },
        { $set: { purchaseSentAt: new Date(), orderId: order._id } },
      );
      const ga = (session as any)?.value ?? session;
      if (!ga?.clientId) return;

      const credentials = await this.siteCredentials(order.externalApiId);
      if (!credentials) return;
      const items = await this.orderItems(order._id);
      const coupon = (order.voucher ?? []).map((v: any) => v?.id).filter(Boolean).join(',');

      await this.send(credentials, ga.clientId, [{
        name: 'purchase',
        params: {
          transaction_id: String(order._id),
          currency: CURRENCY,
          value: Number(order.totalAmount) || 0,
          shipping: Number(order.deliveryFee) || 0,
          ...(coupon ? { coupon } : {}),
          ...(ga.sessionId ? { session_id: ga.sessionId } : {}),
          engagement_time_msec: 1,
          items,
        },
      }]);
      this.logger.info(`${LOG} purchase sent`, { orderId: String(order._id), items: items.length });
    } catch (err) {
      this.logger.error(`${LOG} purchase not sent`, { orderId, err: (err as Error).message });
    }
  }

  // payment declined, cancelled or expired - never throws
  async sendPaymentFailed(orderId: unknown, reason: string): Promise<void> {
    try {
      const order = oid(orderId) && await this.col('orders').findOne({ _id: oid(orderId)! });
      if (!order) return;
      const cart = await this.col('carts').findOne({ orderId: order._id }, { projection: { _id: 1 } })
        ?? await this.col('carts').findOne({ orderId: String(order._id) }, { projection: { _id: 1 } });
      const ga = cart && await this.col('checkoutgasessions').findOne({ cartId: cart._id });
      if (!ga?.clientId) return;
      const credentials = await this.siteCredentials(order.externalApiId);
      if (!credentials) return;
      await this.send(credentials, ga.clientId, [{
        name: 'payment_failed',
        params: {
          transaction_id: String(order._id),
          currency: CURRENCY,
          value: Number(order.totalAmount) || 0,
          reason: String(reason).slice(0, 100),
          ...(ga.sessionId ? { session_id: ga.sessionId } : {}),
          engagement_time_msec: 1,
        },
      }]);
    } catch (err) {
      this.logger.error(`${LOG} payment_failed not sent`, { orderId, err: (err as Error).message });
    }
  }
}
