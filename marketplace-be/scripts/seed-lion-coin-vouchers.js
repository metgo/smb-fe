/**
 * Seeds the Lion Coin v2 voucher pool: N vouchers of ₪500 that back the promotion vouchers
 * (one pool voucher per reserved promotion voucher). Shaped like the existing GALIL vouchers.
 *
 * Refuses to run against the prod cluster - prod's pool is created by the business.
 *
 * Usage:
 *   ENV_FILE=uat.env node scripts/seed-lion-coin-vouchers.js --count 500           # dry run
 *   ENV_FILE=uat.env node scripts/seed-lion-coin-vouchers.js --count 500 --apply
 */

const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config({ path: process.env.ENV_FILE || '.env' });

const { MONGODB_URI } = process.env;
const APPLY = process.argv.includes('--apply');
const countArgIndex = process.argv.indexOf('--count');
const COUNT = countArgIndex > -1 ? Number(process.argv[countArgIndex + 1]) : 500;

const PROD_CLUSTER_HOST = 'kraken.evve2.mongodb.net';
const VOUCHER_VALUE = 500;
const CAMPAIGN_CODE = 'GALIL';
const POOL_ASSIGNEE = { name: 'Lion Coin', email: 'support@metgo.app' };
const VALID_FOR_YEARS = 2;

const generateCode = () => `${CAMPAIGN_CODE}${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

async function seed() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is required (set ENV_FILE)');
  if (MONGODB_URI.includes(PROD_CLUSTER_HOST)) throw new Error('Refusing to seed the prod cluster');
  if (!Number.isInteger(COUNT) || COUNT < 1 || COUNT > 5000) throw new Error('--count must be 1..5000');

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const vouchers = db.collection('vouchers');

  // Copy campaign, assignee and purchaser from the existing pool so the new vouchers match it.
  const template = await vouchers.findOne({
    'assigneeInfo.name': POOL_ASSIGNEE.name,
    'assigneeInfo.email': POOL_ASSIGNEE.email,
  });
  if (!template) throw new Error('No existing Lion Coin voucher to copy campaign/assignee from');

  const existing = await vouchers.countDocuments({
    'assigneeInfo.name': POOL_ASSIGNEE.name,
    'assigneeInfo.email': POOL_ASSIGNEE.email,
    amount: VOUCHER_VALUE,
  });
  console.log(`DB: ${db.databaseName} on ${MONGODB_URI.split('@')[1]?.split('/')[0]}`);
  console.log(`Existing ₪${VOUCHER_VALUE} Lion Coin vouchers: ${existing}`);
  console.log(`${APPLY ? 'Creating' : '[dry run] Would create'} ${COUNT} more (campaign ${template.campId})`);
  if (!APPLY) return;

  const now = new Date();
  const expireDate = new Date(now);
  expireDate.setFullYear(expireDate.getFullYear() + VALID_FOR_YEARS);

  const docs = Array.from({ length: COUNT }, () => ({
    createdAt: now,
    updatedAt: now,
    createdBy: null,
    updatedBy: null,
    deletedBy: null,
    deletedAt: null,
    isDeleted: false,
    amount: VOUCHER_VALUE,
    code: generateCode(),
    remainingAmount: VOUCHER_VALUE,
    paymentStatus: 'PAID',
    status: 'ASSIGNED',
    type: template.type || 'REGULAR',
    campId: template.campId,
    expireDate,
    lastReminderSentAt: null,
    promoDetails: [],
    creatorInfo: { ...(template.creatorInfo || {}), createdAt: now },
    assigneeInfo: { ...template.assigneeInfo, assignedAt: now },
    purchaserInfo: template.purchaserInfo,
    message: '',
    qrCodeUrl: null,
    __v: 0,
  }));

  const codes = docs.map(doc => doc.code);
  const clashes = await vouchers.countDocuments({ code: { $in: codes } });
  if (clashes || new Set(codes).size !== codes.length) throw new Error('Generated code clash - re-run');

  const result = await vouchers.insertMany(docs, { ordered: true });
  console.log(`Created ${result.insertedCount} vouchers. Pool now: ${existing + result.insertedCount}`);
}

seed()
  .catch(error => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
