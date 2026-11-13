// Google Wallet – Generic pass for subscriptions (מנויים)
// npm install google-auth-library jsonwebtoken
//
// ENV:
//   WALLET_ISSUER_ID            – Issuer ID from Google Pay & Wallet Console
//   GOOGLE_APPLICATION_CREDENTIALS – path to the service-account JSON key




const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const ISSUER_ID = process.env.WALLET_ISSUER_ID;
const KEY_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentials = require(require('path').resolve(KEY_FILE)); // resolve relative to the working directory

const LANG = 'he';
const MAX_FRONT_ITEMS = 3; // catalogue items shown on the card front

const auth = new GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
});

// ---------- helpers ----------

const t = (value) => ({ defaultValue: { language: LANG, value: String(value) } });

const image = (uri, description) => ({
  sourceUri: { uri },
  contentDescription: t(description),
});

// IDs may only contain letters, numbers, '.', '_' and '-'
const safeId = (s) => String(s).replace(/[^\w.-]/g, '_');

const classIdFor = (businessId) => `${ISSUER_ID}.business_${safeId(businessId)}`;
const objectIdFor = (subscriptionId) => `${ISSUER_ID}.sub_${safeId(subscriptionId)}`;

const TYPE_LABEL = { SERVICE: 'שירות', PRODUCT: 'מוצר' };

const formatDate = (iso) =>
  new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(iso)
  );

async function request(method, path, body) {
  const client = await auth.getClient();
  try {
    const res = await client.request({ url: `${BASE_URL}${path}`, method, data: body });
    return res.data;
  } catch (err) {
    err.status = err.response?.status;
    throw err;
  }
}

// Insert, or patch if it already exists
async function upsert(resource, id, body) {
  try {
    return await request('POST', `/${resource}`, body);
  } catch (err) {
    if (err.status !== 409) throw err;
    return request('PATCH', `/${resource}/${encodeURIComponent(id)}`, body);
  }
}

// ---------- class (one per business) ----------

function buildClass(business) {
  const frontFields = Array.from({ length: MAX_FRONT_ITEMS }, (_, i) => ({
    firstValue: { fields: [{ fieldPath: `object.textModulesData['item_${i}']` }] },
  }));

  return {
    id: classIdFor(business._id),
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            threeItems: {
              startItem: frontFields[0],
              middleItem: frontFields[1],
              endItem: frontFields[2],
            },
          },
          {
            oneItem: {
              item: { firstValue: { fields: [{ fieldPath: "object.textModulesData['expiry']" }] } },
            },
          },
        ],
      },
    },
  };
}

// ---------- object (one per subscription) ----------

function buildObject(sub) {
  const expired = sub.expiryDate && new Date(sub.expiryDate) < new Date();

  const itemModules = sub.catalogues.map((c, i) => ({
    id: `item_${i}`,
    header: c.name,
    body: `${c.remaining} / ${c.quantity} נותרו · ${TYPE_LABEL[c.type] ?? c.type}`,
  }));

  return {
    id: objectIdFor(sub._id),
    classId: classIdFor(sub.businessId._id),
    state: expired ? 'EXPIRED' : 'ACTIVE',
    hexBackgroundColor: '#1F3A5F',
    logo: image(sub.businessId.logo, sub.businessId.name),
    cardTitle: t(sub.businessId.name),
    header: t(sub.name),
    subheader: t(sub.description),
    heroImage: sub.image ? image(sub.image, sub.name) : undefined,
    textModulesData: [
      ...itemModules,
      { id: 'expiry', header: 'בתוקף עד', body: formatDate(sub.expiryDate) },
    ],
    validTimeInterval: sub.expiryDate ? { end: { date: sub.expiryDate } } : undefined,
    barcode: { type: 'QR_CODE', value: String(sub._id), alternateText: String(sub._id).slice(-8) },
  };
}

// ---------- public API ----------

/**
 * Creates/updates the class + object and returns an "Add to Google Wallet" URL.
 */
async function createSubscriptionPass(subscription) {
  await upsert('genericClass', classIdFor(subscription.businessId._id), buildClass(subscription.businessId));
  const object = buildObject(subscription);
  await upsert('genericObject', object.id, object);

  const token = jwt.sign(
    {
      iss: credentials.client_email,
      aud: 'google',
      typ: 'savetowallet',
      origins: [], // add your web domain(s) if you use the JS button
      payload: { genericObjects: [{ id: object.id }] },
    },
    credentials.private_key,
    { algorithm: 'RS256' }
  );

  return `https://pay.google.com/gp/v/save/${token}`;
}

/**
 * Call this whenever `remaining` changes – the pass updates on the user's phone.
 */
async function updateSubscriptionPass(subscription) {
  const object = buildObject(subscription);
  return request('PATCH', `/genericObject/${encodeURIComponent(object.id)}`, {
    state: object.state,
    textModulesData: object.textModulesData,
    validTimeInterval: object.validTimeInterval,
  });
}

module.exports = { createSubscriptionPass, updateSubscriptionPass };

// ---------- example ----------
// const { createSubscriptionPass } = require('./googleWallet');
// app.get('/subscriptions/:id/wallet', async (req, res) => {
//   const sub = await Subscription.findById(req.params.id).populate('businessId', 'name logo').lean();
//   res.json({ url: await createSubscriptionPass(sub) });
// });