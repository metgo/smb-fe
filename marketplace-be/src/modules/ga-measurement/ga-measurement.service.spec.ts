import axios from 'axios';
import mongoose from 'mongoose';

import { GaMeasurementService } from './ga-measurement.service';

jest.mock('axios');

const orderId = new mongoose.Types.ObjectId();
const cartId = new mongoose.Types.ObjectId();
const siteId = new mongoose.Types.ObjectId();
const productId = new mongoose.Types.ObjectId();
const businessId = new mongoose.Types.ObjectId();

const cursor = (rows: unknown[]) => ({
  project: () => ({ toArray: async () => rows }),
  toArray: async () => rows,
});

const build = (opts: { session?: any; secret?: any; measurementId?: string } = {}) => {
  const collections: Record<string, any> = {
    checkoutgasessions: {
      updateOne: jest.fn(async () => ({})),
      findOneAndUpdate: jest.fn(async () => opts.session ?? null),
      findOne: jest.fn(async () => opts.session ?? null),
      createIndex: jest.fn(),
    },
    orders: {
      findOne: jest.fn(async () => ({
        _id: orderId, externalApiId: siteId, totalAmount: 120, deliveryFee: 20, voucher: [],
      })),
      find: jest.fn(() => cursor([])),
    },
    carts: { findOne: jest.fn(async () => ({ _id: cartId })) },
    externalapis: { findOne: jest.fn(async () => ({ googleAnalyticsId: opts.measurementId ?? 'G-ABC123' })) },
    siteanalyticssecrets: {
      findOne: jest.fn(async () => (opts.secret === undefined ? { gaApiSecret: 'secret_123456' } : opts.secret)),
    },
    orderproducts: {
      find: jest.fn(() => cursor([{
        itemId: productId, itemType: 'PRODUCT', quantity: 2, amount: 50,
      }])),
    },
    products: { find: jest.fn(() => cursor([{ _id: productId, name: 'Olive oil', businessId }])) },
    tickets: { find: jest.fn(() => cursor([])) },
    events: { find: jest.fn(() => cursor([])) },
    businesses: { find: jest.fn(() => cursor([{ _id: businessId, nameHe: 'Farm' }])) },
  };
  const connection = { collection: (name: string) => collections[name] };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return { service: new GaMeasurementService(logger as any, connection as any), collections };
};

describe('GaMeasurementService', () => {
  beforeEach(() => (axios.post as jest.Mock).mockReset().mockResolvedValue({}));

  it('stores only well-formed GA ids', async () => {
    const { service, collections } = build();
    await service.rememberCheckout(String(cartId), { 'x-ga-client-id': 'not-an-id' });
    expect(collections.checkoutgasessions.updateOne).not.toHaveBeenCalled();
    await service.rememberCheckout(String(cartId), {
      'x-ga-client-id': '123456.7890', 'x-ga-session-id': '1712345678',
    });
    expect(collections.checkoutgasessions.updateOne).toHaveBeenCalledWith(
      { cartId },
      expect.objectContaining({ $set: expect.objectContaining({ clientId: '123456.7890', sessionId: '1712345678' }) }),
      { upsert: true },
    );
  });

  it('sends one purchase with items tagged by business', async () => {
    const { service } = build({ session: { clientId: '123.456', sessionId: '99' } });
    await service.sendPurchase(String(orderId));
    expect(axios.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = (axios.post as jest.Mock).mock.calls[0];
    expect(url).toContain('/mp/collect');
    expect(config.params).toEqual({ measurement_id: 'G-ABC123', api_secret: 'secret_123456' });
    expect(body.client_id).toBe('123.456');
    expect(body.events[0]).toMatchObject({
      name: 'purchase',
      params: {
        transaction_id: String(orderId),
        currency: 'ILS',
        value: 120,
        shipping: 20,
        session_id: '99',
        items: [{
          item_id: String(productId),
          item_name: 'Olive oil',
          item_brand: 'Farm',
          business_id: String(businessId),
          price: 50,
          quantity: 2,
        }],
      },
    });
  });

  it('sends nothing without consent ids, already sent, or missing site credentials', async () => {
    await build({ session: null }).service.sendPurchase(String(orderId));
    await build({ session: { clientId: '1.2' }, secret: null }).service.sendPurchase(String(orderId));
    await build({ session: { clientId: '1.2' }, measurementId: '417818080' }).service.sendPurchase(String(orderId));
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('never throws when GA4 is unreachable', async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error('network'));
    await expect(
      build({ session: { clientId: '1.2' } }).service.sendPurchase(String(orderId)),
    ).resolves.toBeUndefined();
  });

  it('uses the given cart for voucher-only orders', async () => {
    const { service, collections } = build({ session: { clientId: '7.8' } });
    const otherCart = new mongoose.Types.ObjectId();
    await service.sendPurchase(String(orderId), String(otherCart));
    expect(collections.carts.findOne).not.toHaveBeenCalled();
    expect(collections.checkoutgasessions.findOneAndUpdate).toHaveBeenCalledWith(
      { cartId: otherCart, purchaseSentAt: null },
      expect.anything(),
    );
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});
