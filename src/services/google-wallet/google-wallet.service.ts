import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { google } from 'googleapis';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { emailDefaultTemplate } from 'src/common/constant';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { PunchCard } from 'src/modules/punch-cards/schema/punch-card.schema';
import { PunchCardStatus } from 'src/modules/punch-cards/punch-cards.type';
import { PunchPass } from 'src/modules/punch-passes/schema/punch-pass.schema';
import { ConfigService } from 'src/services/config/config.service';
import { GcpBucketService } from 'src/services/gcp-bucket/gcp-bucket.services';
import {
  GoogleWalletObjectState,
  GoogleWalletPass,
} from 'src/services/google-wallet/google-wallet.type';

const sharp = require('sharp');

const BASE_URL = 'https://walletobjects.googleapis.com/walletobjects/v1';
const SAVE_URL = 'https://pay.google.com/gp/v/save';
const SCOPE = 'https://www.googleapis.com/auth/wallet_object.issuer';
const LANG = 'he';
const BACKGROUND_COLOR = '#1F3A5F';
const FALLBACK_LOGO = emailDefaultTemplate.MAIN_LOGO;

const STAMP_COLS = 5;
const STAMP_SIZE = 64;
const STAMP_GAP = 20;
const STAMP_PADDING = 28;

type WalletBusiness = Pick<Business, 'name' | 'nameHe' | 'nameAr' | 'logo'>;

const STATE_BY_STATUS: Record<PunchCardStatus, GoogleWalletObjectState> = {
  [PunchCardStatus.ACTIVE]: GoogleWalletObjectState.ACTIVE,
  [PunchCardStatus.COMPLETED]: GoogleWalletObjectState.COMPLETED,
  [PunchCardStatus.EXPIRED]: GoogleWalletObjectState.EXPIRED,
  [PunchCardStatus.CANCELLED]: GoogleWalletObjectState.INACTIVE,
};

const TYPE_HE: Record<string, string> = {
  PRODUCT: 'מוצר',
  SERVICE: 'שירות',
  CLASS: 'שיעור',
  EVENT: 'אירוע',
  OTHER: 'אחר',
};

// Same stamp icon for every catalogue type (replaces the earlier per-type
// Heroicons set - simpler, and matches the punch-card metaphor directly
// regardless of what the catalogue item actually is). Used circles get the
// MetGo brand gradient (see recolorToBrandGradient()), outline icon
// (recolored black->white, see getStampIcons()) for remaining ones - Barak
// wanted a clearer visual difference than just the circle fill/outline
// alone, then asked for the used icon to match MetGo's brand colors
// instead of plain orange.
const STAMP_ICON_URL = 'https://storage.googleapis.com/tav8-sderot20w3s71w1n/icons/stamp.png';
const STAMP_ICON_OUTLINE_URL = 'https://storage.googleapis.com/tav8-sderot20w3s71w1n/icons/stamp-black.png';

// Exact stripe colors (top to bottom) from Workspace-FE's own
// public/assets/images/nati_icon_color.svg - the MetGo balloon logo.
const BRAND_GRADIENT_STOPS: Array<[number, number, number]> = [
  [0xff, 0x66, 0x33], // orange
  [0xfd, 0xcb, 0x00], // yellow
  [0x99, 0xcc, 0x33], // green
  [0x00, 0x99, 0xff], // blue
];

// Google Wallet's Generic pass "Details" list renders left-aligned
// regardless of content - confirmed by test purchase, and prepending the
// Unicode right-to-left mark (U+200F) made no visible difference. No field
// in the Generic pass API controls this; appears to be a platform
// limitation on Google's side, not something fixable from our payload.
const localized = (value: string) => ({
  defaultValue: { language: LANG, value: String(value ?? '') },
});

const image = (uri: string, description: string) => ({
  sourceUri: { uri },
  contentDescription: localized(description),
});

// Wallet IDs may only contain letters, numbers, '.', '_' and '-'
const safeId = (value: unknown) => String(value).replace(/[^\w.-]/g, '_');

const formatDate = (date: Date) => new Intl.DateTimeFormat('he-IL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date(date));

@Injectable()
export class GoogleWalletService {
  private readonly issuerId: string;

  private readonly auth: InstanceType<typeof google.auth.GoogleAuth>;

  private readonly jwtService = new JwtService();

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    @InjectModel(Business.name)
    private BusinessModel: Model<Business>,
    private readonly configService: ConfigService,
    private readonly gcpBucketService: GcpBucketService,
  ) {
    const { ISSUER_ID, KEY_FILE } = this.configService.googleWallet;

    this.issuerId = ISSUER_ID;
    this.auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: [SCOPE],
    });
  }

  get isEnabled(): boolean {
    return !!this.issuerId;
  }

  /**
   * Creates (or refreshes) the Google Wallet object for a punch card and
   * returns the "Add to Google Wallet" link. Google does not allow pushing a
   * pass into a user's wallet server-side - the purchaser must open this
   * link once, after which the pass stays in sync via updatePunchCardPass.
   */
  async createPunchCardPass(
    punchCard: PunchCard,
    punchPass: PunchPass,
  ): Promise<GoogleWalletPass | null> {
    if (!this.isEnabled) {
      this.logger.warn('[GOOGLE-WALLET]: WALLET_ISSUER_ID not set, skipping');
      return null;
    }

    const business = await this.BusinessModel.findById(punchCard.businessId)
      .select('name nameHe nameAr logo')
      .lean<WalletBusiness>();

    const classId = this.classIdFor(punchCard.businessId);
    await this.insertIfMissing('genericClass', this.buildClass(classId));

    const object = await this.buildObject(classId, punchCard, punchPass, business);
    try {
      await this.upsert('genericObject', object.id, object);
    } catch (err) {
      // Google fetches every image URL and rejects the whole object if one
      // is unreachable - retry with our own logo and no hero image rather
      // than leaving the purchaser without a pass.
      if (err.status !== 400 || !/image/i.test(err.message)) throw err;
      this.logger.warn('[GOOGLE-WALLET]: IMAGE REJECTED, RETRYING WITHOUT', {
        punchCardId: punchCard._id,
        err: err.message,
      });
      await this.upsert('genericObject', object.id, {
        ...object,
        logo: image(FALLBACK_LOGO, object.cardTitle.defaultValue.value),
        heroImage: undefined,
      });
    }

    const saveUrl = await this.buildSaveUrl(object.id);

    this.logger.info('[GOOGLE-WALLET]: PASS CREATED', {
      punchCardId: punchCard._id,
      objectId: object.id,
    });

    return { objectId: object.id, saveUrl };
  }

  /**
   * Call whenever usedItems / remainingItems / status changes on a card -
   * the pass already saved on the purchaser's phone updates automatically.
   */
  async updatePunchCardPass(punchCard: PunchCard): Promise<void> {
    if (!this.isEnabled || !punchCard.walletGoogleObjectId) return;

    let heroImageUrl: string | null = null;
    try {
      heroImageUrl = await this.renderStampGridImage(punchCard);
    } catch (err) {
      this.logger.warn('[GOOGLE-WALLET]: FAILED TO REGENERATE STAMP IMAGE', {
        punchCardId: punchCard._id,
        err: err instanceof Error ? err.message : String(err),
      });
    }

    await this.request(
      'PATCH',
      `/genericObject/${encodeURIComponent(punchCard.walletGoogleObjectId)}`,
      {
        state: STATE_BY_STATUS[punchCard.status],
        textModulesData: this.buildTextModules(punchCard),
        ...(heroImageUrl && { heroImage: image(heroImageUrl, punchCard.cardNumber) }),
      },
    );
  }

  // ---------- builders ----------

  private classIdFor(businessId: unknown) {
    return `${this.issuerId}.punch_pass_business_${safeId(businessId)}`;
  }

  private objectIdFor(punchCardId: unknown) {
    return `${this.issuerId}.punch_card_${safeId(punchCardId)}`;
  }

  // eslint-disable-next-line class-methods-use-this
  private buildClass(classId: string) {
    const fieldRow = (id: string) => ({
      oneItem: {
        item: {
          firstValue: {
            fields: [{ fieldPath: `object.textModulesData['${id}']` }],
          },
        },
      },
    });

    return {
      id: classId,
      classTemplateInfo: {
        cardTemplateOverride: {
          cardRowTemplateInfos: [fieldRow('remaining'), fieldRow('valid_until')],
        },
      },
    };
  }

  // eslint-disable-next-line class-methods-use-this
  // Uses localizedHeader/localizedBody (not plain header/body) so Google
  // renders these RTL for Hebrew - cardTitle/header/subheader in
  // buildObject() already go through localized() for the same reason,
  // these rows were the one place that got missed.
  private buildTextModules(punchCard: PunchCard) {
    const itemModules = (punchCard.items || [])
      .filter(item => item.nameHe || item.name || item.nameAr)
      .map((item, i) => {
        const label = item.nameHe || item.name || item.nameAr;
        const remaining = item.quantity - item.usedCount;
        const typeHe = TYPE_HE[item.type] || item.type;
        return {
          id: `item_${i}`,
          localizedHeader: localized(label),
          localizedBody: localized(`${remaining}/${item.quantity} נותרו · ${typeHe}`),
        };
      });

    return [
      {
        id: 'remaining',
        localizedHeader: localized('ניקובים שנותרו'),
        localizedBody: localized(`${punchCard.remainingItems} / ${punchCard.totalItems}`),
      },
      {
        id: 'valid_until',
        localizedHeader: localized('בתוקף עד'),
        localizedBody: localized(formatDate(punchCard.validUntil)),
      },
      ...itemModules,
    ];
  }

  // Fetched and resized once, reused across every render - neither icon
  // changes, no reason to re-download/re-resize/re-recolor per punch card.
  private stampIcons: { used: Buffer; remaining: Buffer } | null | undefined;

  // The outline asset is black-on-transparent (readable on a white page),
  // which is nearly invisible on our dark navy background - force every
  // opaque pixel to white, keeping the original alpha (shape) untouched.
  private static async recolorToWhite(buffer: Buffer): Promise<Buffer> {
    const { data, info } = await sharp(buffer).ensureAlpha().raw()
      .toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
    return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toBuffer();
  }

  // Paints the used-stamp icon with MetGo's brand gradient (top to bottom,
  // same stripe order as the balloon logo), keeping the original alpha
  // (shape) untouched - same raw-pixel approach as recolorToWhite().
  private static async recolorToBrandGradient(buffer: Buffer): Promise<Buffer> {
    const { data, info } = await sharp(buffer).ensureAlpha().raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;
    const lastStop = BRAND_GRADIENT_STOPS.length - 1;

    for (let y = 0; y < height; y += 1) {
      const t = height > 1 ? (y / (height - 1)) * lastStop : 0;
      const i0 = Math.min(Math.floor(t), lastStop);
      const i1 = Math.min(i0 + 1, lastStop);
      const frac = t - i0;
      const [r0, g0, b0] = BRAND_GRADIENT_STOPS[i0];
      const [r1, g1, b1] = BRAND_GRADIENT_STOPS[i1];
      const r = Math.round(r0 + (r1 - r0) * frac);
      const g = Math.round(g0 + (g1 - g0) * frac);
      const b = Math.round(b0 + (b1 - b0) * frac);

      for (let x = 0; x < width; x += 1) {
        const idx = (y * width + x) * channels;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      }
    }

    return sharp(data, { raw: { width, height, channels: 4 } })
      .png()
      .toBuffer();
  }

  private async getStampIcons(): Promise<{ used: Buffer; remaining: Buffer } | null> {
    if (this.stampIcons !== undefined) return this.stampIcons;

    try {
      const iconSize = Math.round(STAMP_SIZE * 0.6);
      const [usedRes, remainingRes] = await Promise.all([
        fetch(STAMP_ICON_URL),
        fetch(STAMP_ICON_OUTLINE_URL),
      ]);
      if (!usedRes.ok) throw new Error(`used icon status ${usedRes.status}`);
      if (!remainingRes.ok) throw new Error(`outline icon status ${remainingRes.status}`);

      const usedRaw = await GoogleWalletService.recolorToBrandGradient(
        Buffer.from(await usedRes.arrayBuffer()),
      );
      const remainingRaw = await GoogleWalletService.recolorToWhite(
        Buffer.from(await remainingRes.arrayBuffer()),
      );

      this.stampIcons = {
        used: await sharp(usedRaw).resize(iconSize, iconSize).toBuffer(),
        remaining: await sharp(remainingRaw).resize(iconSize, iconSize).toBuffer(),
      };
    } catch (err) {
      this.logger.warn('[GOOGLE-WALLET]: FAILED TO FETCH STAMP ICONS', {
        err: err instanceof Error ? err.message : String(err),
      });
      this.stampIcons = null;
    }
    return this.stampIcons;
  }

  private async renderStampGridImage(punchCard: PunchCard): Promise<string | null> {
    try {
      const total = punchCard.totalItems || 0;
      if (!total) return null;

      const cols = Math.min(STAMP_COLS, total);
      const rows = Math.ceil(total / cols);
      const width = cols * STAMP_SIZE + (cols - 1) * STAMP_GAP + STAMP_PADDING * 2;
      const height = rows * STAMP_SIZE + (rows - 1) * STAMP_GAP + STAMP_PADDING * 2;

      const positions = Array.from({ length: total }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return {
          cx: STAMP_PADDING + col * (STAMP_SIZE + STAMP_GAP) + STAMP_SIZE / 2,
          cy: STAMP_PADDING + row * (STAMP_SIZE + STAMP_GAP) + STAMP_SIZE / 2,
          used: i < (punchCard.usedItems || 0),
        };
      });

      const circles = positions
        .map(({ cx, cy, used }) => (used
          ? `<circle cx="${cx}" cy="${cy}" r="${STAMP_SIZE / 2}" fill="#ffffff" />`
          : `<circle cx="${cx}" cy="${cy}" r="${STAMP_SIZE / 2 - 2}" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" />`))
        .join('');

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="${BACKGROUND_COLOR}" />
        ${circles}
      </svg>`;

      let sharpImage = sharp(Buffer.from(svg));

      const stampIcons = await this.getStampIcons();
      if (stampIcons) {
        const iconSize = Math.round(STAMP_SIZE * 0.6);
        sharpImage = sharpImage.composite(positions.map(({ cx, cy, used }) => ({
          input: used ? stampIcons.used : stampIcons.remaining,
          left: Math.round(cx - iconSize / 2),
          top: Math.round(cy - iconSize / 2),
        })));
      }

      const buffer = await sharpImage.png().toBuffer();
      const file = {
        buffer,
        size: buffer.length,
        originalname: `punch-card-${punchCard._id}-stamps.png`,
        // eslint-disable-next-line no-undef
      } as Express.Multer.File;

      return await this.gcpBucketService.upload(file);
    } catch (err) {
      this.logger.warn('[GOOGLE-WALLET]: FAILED TO RENDER STAMP IMAGE', {
        punchCardId: punchCard._id,
        err: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  private async buildObject(
    classId: string,
    punchCard: PunchCard,
    punchPass: PunchPass,
    business: WalletBusiness | null,
  ) {
    const businessName = business?.nameHe || business?.name || business?.nameAr || '';
    const passName = punchPass.nameHe || punchPass.name || punchPass.nameAr || '';
    const description = punchPass.descriptionHe || punchPass.description;
    const stampImageUrl = await this.renderStampGridImage(punchCard);
    const passImage = punchPass.images?.find(img => img.isPrimary)?.image
      || punchPass.images?.[0]?.image;

    return {
      id: this.objectIdFor(punchCard._id),
      classId,
      state: STATE_BY_STATUS[punchCard.status] ?? GoogleWalletObjectState.ACTIVE,
      hexBackgroundColor: BACKGROUND_COLOR,
      logo: image(passImage || FALLBACK_LOGO, passName),
      cardTitle: localized(businessName),
      header: localized(passName),
      subheader: description ? localized(description) : undefined,
      heroImage: stampImageUrl ? image(stampImageUrl, passName) : undefined,
      textModulesData: this.buildTextModules(punchCard),
      validTimeInterval: {
        end: { date: new Date(punchCard.validUntil).toISOString() },
      },
      barcode: {
        type: 'QR_CODE',
        value: punchCard.redemptionToken,
        alternateText: punchCard.cardNumber,
      },
    };
  }

  private async buildSaveUrl(objectId: string): Promise<string> {
    const { client_email: clientEmail, private_key: privateKey }
      = await this.auth.getCredentials();

    const token = this.jwtService.sign(
      {
        iss: clientEmail,
        aud: 'google',
        typ: 'savetowallet',
        origins: [],
        payload: { genericObjects: [{ id: objectId }] },
      },
      { privateKey, algorithm: 'RS256' },
    );

    return `${SAVE_URL}/${token}`;
  }

  // ---------- REST helpers ----------

  private async request(method: 'GET' | 'POST' | 'PATCH', path: string, data?: unknown) {
    const client = await this.auth.getClient();

    try {
      const res = await client.request({ url: `${BASE_URL}${path}`, method, data });
      return res.data;
    } catch (err) {
      err.status = err.response?.status;
      throw err;
    }
  }

  private async insertIfMissing(resource: string, body: { id: string }) {
    try {
      await this.request('POST', `/${resource}`, body);
    } catch (err) {
      if (err.status !== 409) throw err;
    }
  }

  private async upsert(resource: string, id: string, body: unknown) {
    try {
      return await this.request('POST', `/${resource}`, body);
    } catch (err) {
      if (err.status !== 409) throw err;
      return this.request('PATCH', `/${resource}/${encodeURIComponent(id)}`, body);
    }
  }
}
