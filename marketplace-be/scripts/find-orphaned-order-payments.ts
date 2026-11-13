/* eslint-disable */
/**
 * READ-ONLY diagnostic script.
 *
 * Finds Payment documents with status SUCCESS that reference an orderId
 * which does not exist in the orders collection — i.e. the customer was
 * charged, but the order they were supposed to get was never created (or
 * disappeared).
 *
 * This script performs ONLY `find` reads. It never calls
 * updateOne/updateMany/deleteOne/deleteMany/save/insertOne on any model —
 * it cannot modify the database.
 *
 * Usage:
 *   MONGODB_URI="<connection string>" npx ts-node -r tsconfig-paths/register scripts/find-orphaned-order-payments.ts
 *
 * Or drop MONGODB_URI into a local .env file and just run:
 *   npx ts-node -r tsconfig-paths/register scripts/find-orphaned-order-payments.ts
 *
 * Output CSV path (defaults to ./orphaned-success-payments.csv):
 *   CSV_FILE=./orphaned-success-payments.csv npx ts-node -r tsconfig-paths/register scripts/find-orphaned-order-payments.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import * as fs from 'fs';

const MONGODB_URI = process.env.MONGODB_URI;
const CSV_FILE = process.env.CSV_FILE || './orphaned-success-payments.csv';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set. Aborting — nothing was connected to.');
  process.exit(1);
}

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: any[]): string {
  const headers = [
    'paymentId',
    'orderId',
    'status',
    'amount',
    'currency',
    'customerName',
    'customerEmail',
    'paymentRequestId',
    'paymentDate',
    'createdAt',
  ];
  const lines = [headers.join(',')];
  rows.forEach(p => {
    lines.push(headers.map(h => csvEscape(p[h])).join(','));
  });
  return lines.join('\n');
}

// Minimal local schemas, intentionally decoupled from the app's Nest
// modules so this script has no side effects and no write methods at all.
const PaymentModel = mongoose.model(
  'Payment',
  new mongoose.Schema({}, { strict: false, collection: 'payments' }),
);
const OrderModel = mongoose.model(
  'Order',
  new mongoose.Schema({}, { strict: false, collection: 'orders' }),
);

async function main() {
  console.log(`Connecting to: ${MONGODB_URI!.replace(/\/\/.*@/, '//<redacted>@')}`);
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected. Running read-only queries...\n');

  // 1. Pull every SUCCESSFUL payment that has an orderId set, projecting only what we need.
  const paymentsWithOrder = await PaymentModel.find(
    { orderId: { $ne: null }, status: 'SUCCESS' },
    {
      orderId: 1,
      status: 1,
      amount: 1,
      currency: 1,
      customerName: 1,
      customerEmail: 1,
      paymentRequestId: 1,
      paymentDate: 1,
      createdAt: 1,
    },
  ).lean();

  console.log(`Found ${paymentsWithOrder.length} SUCCESS payment(s) with an orderId set.`);

  if (!paymentsWithOrder.length) {
    console.log('Nothing to check. Exiting.');
    await mongoose.disconnect();
    return;
  }

  // 2. Batch-check which of those orderIds actually exist in orders,
  //    in a single query rather than one lookup per payment.
  const orderIds = [...new Set(paymentsWithOrder.map(p => String((p as any).orderId)))];

  const existingOrders = await OrderModel.find(
    { _id: { $in: orderIds } },
    { _id: 1, deletedAt: 1, isDeleted: 1, paymentStatus: 1, status: 1 },
  ).lean();

  const existingOrderMap = new Map(existingOrders.map(o => [String(o._id), o]));

  // 3. Diff: payments whose orderId has no matching order document at all.
  const orphaned = paymentsWithOrder.filter(
    p => !existingOrderMap.has(String((p as any).orderId)),
  );

  console.log(`\n${orphaned.length} SUCCESS payment(s) reference an orderId with NO matching order document.\n`);

  if (orphaned.length) {
    console.log('--- Orphaned SUCCESS payments ---');
    orphaned.forEach((p: any, i) => {
      console.log(`${i + 1}. paymentId=${p._id} orderId=${p.orderId} amount=${p.amount} ${p.currency || ''}`);
      console.log(`   customer=${p.customerName} <${p.customerEmail}>`);
      console.log(`   paymentDate=${p.paymentDate}`);
      console.log('');
    });

    const csvRows = orphaned.map((p: any) => ({
      paymentId: p._id,
      orderId: p.orderId,
      status: p.status,
      amount: p.amount,
      currency: p.currency,
      customerName: p.customerName,
      customerEmail: p.customerEmail,
      paymentRequestId: p.paymentRequestId,
      paymentDate: p.paymentDate,
      createdAt: p.createdAt,
    }));
    fs.writeFileSync(CSV_FILE, toCsv(csvRows));
    console.log(`CSV written to ${CSV_FILE} (${orphaned.length} row(s))`);
  } else {
    console.log('No orphaned SUCCESS payments found — no CSV written.');
  }

  console.log('\nDone. No writes were made to the database.');
  await mongoose.disconnect();
}

main().catch(async err => {
  console.error('Script failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
