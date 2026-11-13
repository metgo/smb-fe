import { promises as dns } from 'dns';
import {
  BadGatewayException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import axios from 'axios';
import { Model } from 'mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ConfigService } from 'src/services/config/config.service';
import { Business } from 'src/modules/business/shared/schema/business.schema';
import { BussCategory } from 'src/modules/buss-categories/schema/buss.category.schema';
import { Accessibility } from 'src/modules/accessibility/schema/accessibility.schema';
import { GroupType } from 'src/modules/group-type/schema/group-type.schema';
import { Tags } from 'src/modules/tags/schema/tags.schema';
import { Authority } from 'src/modules/authority/schema/authority.schema';
import { GenerateProfileRequest } from './requests/generate-profile.request';
import { ResolveAuthorityRequest } from './requests/resolve-authority.request';
import { BUSINESS_TAXONOMY } from './business-taxonomy';
import {
  DAYS,
  FULL_DESC_MAX,
  GeneratedProfile,
  OnboardingTaxonomy,
  RawAiProfile,
  SHORT_DESC_MAX,
  htmlToText,
  isPrivateAddress,
  matchAuthorityByName,
  normalizeChosenTypes,
  normalizeCity,
  normalizeProfile,
  voteNearestAuthority,
} from './vendor-onboarding.utils';

const MODEL = 'gemini-3-flash-preview';
const CACHE_MS = 10 * 60 * 1000;

export interface ResolvedAuthority {
  authorityId: string | null;
  authorityName: string | null;
  dmoId: string | null;
  method: 'name' | 'city' | 'nearby' | 'ai' | 'none';
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

@Injectable()
export class VendorOnboardingService {
  private ai: GoogleGenAI | null;

  private taxonomyCache: { at: number; value: OnboardingTaxonomy } | null = null;

  private pointsCache: {
    at: number;
    value: { authorityId: string; lat: number; long: number }[];
  } | null = null;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Business.name) private readonly BusinessModel: Model<Business>,
    @InjectModel(BussCategory.name) private readonly CategoryModel: Model<BussCategory>,
    @InjectModel(Accessibility.name) private readonly AccessibilityModel: Model<Accessibility>,
    @InjectModel(GroupType.name) private readonly GroupTypeModel: Model<GroupType>,
    @InjectModel(Tags.name) private readonly TagsModel: Model<Tags>,
    @InjectModel(Authority.name) private readonly AuthorityModel: Model<Authority>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    this.ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  /* --------------------------------------------------------- taxonomy --- */

  async getTaxonomy(): Promise<OnboardingTaxonomy> {
    if (this.taxonomyCache && Date.now() - this.taxonomyCache.at < CACHE_MS) {
      return this.taxonomyCache.value;
    }
    const notDeleted = { isDeleted: { $ne: true } };
    const [categories, accessibilities, groupTypes, tags] = await Promise.all([
      this.CategoryModel.find({ ...notDeleted, isVisible: { $ne: false } })
        .select('name hebrewName').lean(),
      this.AccessibilityModel.find(notDeleted).select('name hebrewName').lean(),
      this.GroupTypeModel.find(notDeleted).select('name hebrewName').lean(),
      this.TagsModel.find(notDeleted).select('name nameHe').limit(400).lean(),
    ]);
    const toItem = (d: any) => ({
      id: String(d._id),
      name: d.name ?? '',
      hebrewName: d.hebrewName ?? '',
    });
    const value: OnboardingTaxonomy = {
      categories: categories.map(toItem),
      accessibilities: accessibilities.map(toItem),
      groupTypes: groupTypes.map(toItem),
      tags: tags.map((t: any) => t.nameHe || t.name).filter(Boolean),
    };
    this.taxonomyCache = { at: Date.now(), value };
    return value;
  }

  /* ---------------------------------------------------------- website --- */

  /**
   * Fetch the vendor's website as plain text. Never throws. Redirects are
   * followed by hand so every hop is checked against private addresses.
   */
  async fetchWebsiteText(url: string | undefined): Promise<string> {
    if (!url) return '';
    try {
      let current = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
      // Sequential by nature: each hop depends on the previous response.
      /* eslint-disable no-await-in-loop */
      for (let hop = 0; hop < 4; hop += 1) {
        if (!['http:', 'https:'].includes(current.protocol)) return '';
        const { address } = await dns.lookup(current.hostname);
        if (isPrivateAddress(address)) return '';
        const res = await axios.get(current.toString(), {
          timeout: 8000,
          maxRedirects: 0,
          maxContentLength: 2 * 1024 * 1024,
          responseType: 'text',
          validateStatus: s => s >= 200 && s < 400,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VendorOnboardingBot/1.0)',
            'Accept-Language': 'he,en;q=0.8',
          },
        });
        if (res.status >= 300) {
          if (!res.headers.location) return '';
          current = new URL(res.headers.location, current);
        } else {
          return typeof res.data === 'string' ? htmlToText(res.data) : '';
        }
      }
      /* eslint-enable no-await-in-loop */
      return '';
    } catch (err: any) {
      this.logger.warn('[ONBOARDING]: website fetch failed', { url, err: err?.message });
      return '';
    }
  }

  /* --------------------------------------------------------- generate --- */

  async generateProfile(body: GenerateProfileRequest): Promise<GeneratedProfile> {
    if (!this.ai) {
      throw new ServiceUnavailableException('GEMINI_API_KEY is not configured');
    }
    const [taxonomy, websiteText] = await Promise.all([
      this.getTaxonomy(),
      this.fetchWebsiteText(body.website),
    ]);
    const products = body.products ?? [];
    const chosenTypes = normalizeChosenTypes(body.selectedCategories, body.mainSubcategory);
    const customLabels = (body.customCategories ?? [])
      .map(c => c.label.trim())
      .filter(Boolean);

    // The vendor's own choice is a fixed fact; without one the model classifies.
    const businessTypesRule = chosenTypes.length
      ? [
        '- businessTypes: the vendor already chose their business type. Treat it as a fixed fact,',
        '  return it unchanged and write the description, tags and highlights to match it. Main activity first:',
        ...chosenTypes.map(t => `  ${t.category}: ${t.subcategories.join(' | ') || '(no subcategory picked)'}`),
        ...(customLabels.length ? [`  The vendor also describes the business as: ${customLabels.join(', ')}`] : []),
      ].join('\n')
      : [
        '- businessTypes: FIRST classify the business with this universal taxonomy. Pick 1 parent category',
        '  (2 only if the business clearly does both), each with 1-3 of its own subcategories, exact spelling:',
        ...BUSINESS_TAXONOMY.map(g => `  ${g.category}: ${g.subcategories.join(' | ')}`),
      ].join('\n');

    const label = (c: { id: string; name: string; hebrewName?: string }) => `${c.id} = ${[c.hebrewName, c.name].filter(Boolean).join(' / ')}`;

    const systemInstruction = `You turn a local business owner's onboarding answers into a business profile
for a Hebrew-language (RTL) marketplace of local businesses in Israel.

The answers: "offer" = "About us" (why they founded it, ideal customers, services, what is special, history);
"edge" = "What customers tell their friends" (feedback they get, why customers come back);
"fit" = who enjoys it most and who it suits less; "reco" = a one-sentence recommendation from a happy customer.

Write in Hebrew. Warm but not salesy. Never invent facts (prices, years, awards, opening hours):
if something is missing, leave it empty and add the field name to confidenceFlags.

Fields:
${businessTypesRule}
- primaryCategoryId: the ONE marketplace category id that best matches businessTypes.
  categoryIds: 1-3 relevant marketplace category ids, primary first.
  Allowed marketplace categories (id = name):
${taxonomy.categories.map(label).join('\n')}
- shortDescription: at most ${SHORT_DESC_MAX - 10} characters, distilled from the customer recommendation.
- description: plain text, at most ${FULL_DESC_MAX - 30} characters, 2 short paragraphs: who they are and what
  they offer (their story and services), then what customers love about them and who it suits.
  Practical details go in "practical", not here.
- tags: 3-8 short Hebrew tags. Prefer these existing tags when they fit: ${taxonomy.tags.slice(0, 300).join(', ')}
- accessibilityIds: only options the vendor or website states or clearly implies (e.g. "parking", "wheelchair access").
  Allowed (id = name):
${taxonomy.accessibilities.map(label).join('\n')}
- groupTypeIds: who it suits. Allowed (id = name):
${taxonomy.groupTypes.map(label).join('\n')}
- openingHours: one entry per day (${DAYS.join(', ')}), 24h "HH:MM". Only if the website or the vendor states them;
  otherwise return an empty list.
- practical: bestTime, parking, accessibility, booking, bring. Take them from the vendor's answer or the website;
  if neither says, infer only what is obvious from the type of business and flag "practical".
- highlights: 3-4 short bullet points.
- socialLinks: Facebook/Instagram/TikTok/YouTube/WhatsApp/website URLs copied exactly from the website text. Never guess.
- products: for each input product (by index) a Hebrew shortDescription of at most ${SHORT_DESC_MAX - 10} characters.`;

    const userContent = JSON.stringify({
      businessName: body.businessName,
      address: body.address ?? {},
      website: body.website ?? '',
      answers: body.answers ?? {},
      products: products.map((p, index) => ({ index, ...p })),
      websiteText: websiteText || undefined,
    });

    const ids = (items: { id: string }[]) => (items.length
      ? { type: 'string', enum: items.map(i => i.id) }
      : { type: 'string' });

    const responseSchema = {
      type: 'object',
      properties: {
        businessTypes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string', enum: BUSINESS_TAXONOMY.map(g => g.category) },
              subcategories: {
                type: 'array',
                items: { type: 'string', enum: [...new Set(BUSINESS_TAXONOMY.flatMap(g => g.subcategories))] },
              },
            },
            required: ['category', 'subcategories'],
          },
        },
        primaryCategoryId: ids(taxonomy.categories),
        categoryIds: { type: 'array', items: ids(taxonomy.categories) },
        shortDescription: { type: 'string' },
        description: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        accessibilityIds: { type: 'array', items: ids(taxonomy.accessibilities) },
        groupTypeIds: { type: 'array', items: ids(taxonomy.groupTypes) },
        openingHours: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              day: { type: 'string', enum: [...DAYS] },
              open: { type: 'string' },
              close: { type: 'string' },
              closed: { type: 'boolean' },
            },
            required: ['day'],
          },
        },
        practical: {
          type: 'object',
          properties: {
            bestTime: { type: 'string' },
            parking: { type: 'string' },
            accessibility: { type: 'string' },
            booking: { type: 'string' },
            bring: { type: 'string' },
          },
        },
        highlights: { type: 'array', items: { type: 'string' } },
        socialLinks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: {
                type: 'string',
                enum: ['facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp', 'website'],
              },
              url: { type: 'string' },
            },
            required: ['platform', 'url'],
          },
        },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              index: { type: 'integer' },
              shortDescription: { type: 'string' },
            },
            required: ['index', 'shortDescription'],
          },
        },
        confidenceFlags: { type: 'array', items: { type: 'string' } },
      },
      required: ['businessTypes', 'primaryCategoryId', 'categoryIds', 'shortDescription', 'description', 'tags'],
    };

    const raw = await this.callModel<RawAiProfile>(systemInstruction, userContent, responseSchema);
    const sourceText = `${body.website ?? ''}\n${websiteText}`;
    const profile = normalizeProfile(raw, taxonomy, products, sourceText, chosenTypes);
    if (body.website && !websiteText) profile.confidenceFlags.push('website:unreadable');
    return profile;
  }

  private async callModel<T>(
    systemInstruction: string,
    contents: string,
    responseSchema: object,
  ): Promise<T> {
    // Retries are sequential on purpose.
    /* eslint-disable no-await-in-loop */
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await this.ai!.models.generateContent({
          model: MODEL,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.6,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });
        return JSON.parse(response.text || '{}') as T;
      } catch (error: any) {
        const retryable = error?.status === 503 || error?.status === 429 || error instanceof SyntaxError;
        if (retryable && attempt < 3) {
          await sleep(2 ** attempt * 1000);
        } else {
          this.logger.error('[ONBOARDING]: Gemini call failed', { err: error?.message });
          throw new BadGatewayException('Profile generation failed, please try again');
        }
      }
    }
    /* eslint-enable no-await-in-loop */
    throw new BadGatewayException('Profile generation failed, please try again');
  }

  /* -------------------------------------------------------- authority --- */

  /**
   * Find the authority (and its DMO) for an address:
   * 1. an authority whose name contains the city,
   * 2. the authority most used by existing businesses in the same city,
   * 3. the majority authority of the nearest businesses (by coordinates),
   * 4. Gemini, choosing from the authority list.
   */
  async resolveAuthority(q: ResolveAuthorityRequest): Promise<ResolvedAuthority> {
    const authorities = (await this.AuthorityModel.find({ isDeleted: { $ne: true } })
      .select('name dmoId').lean()).map((a: any) => ({
      id: String(a._id),
      name: a.name as string,
      dmoId: a.dmoId ? String(a.dmoId) : null,
    }));
    const byId = new Map(authorities.map(a => [a.id, a]));
    const result = (id: string | null, method: ResolvedAuthority['method']): ResolvedAuthority => {
      const a = id ? byId.get(id) : undefined;
      return a
        ? {
          authorityId: a.id, authorityName: a.name, dmoId: a.dmoId, method,
        }
        : {
          authorityId: null, authorityName: null, dmoId: null, method: 'none',
        };
    };
    if (!authorities.length) return result(null, 'none');

    // 1. Name contains the city.
    const byName = matchAuthorityByName(authorities, q.city);
    if (byName) return result(byName.id, 'name');

    // 2. Existing businesses in the same city.
    const city = normalizeCity(q.city);
    if (city) {
      const escaped = q.city!.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rows = await this.BusinessModel.aggregate([
        {
          $match: {
            isDeleted: { $ne: true },
            authorityId: { $ne: null },
            'address.city': { $regex: `^\\s*${escaped}\\s*$`, $options: 'i' },
          },
        },
        { $group: { _id: '$authorityId', n: { $sum: 1 } } },
        { $sort: { n: -1 } },
        { $limit: 2 },
      ]);
      const total = rows.reduce((s: number, r: any) => s + r.n, 0);
      if (rows.length && rows[0].n / total > 0.5 && byId.has(String(rows[0]._id))) {
        return result(String(rows[0]._id), 'city');
      }
    }

    // 3. Nearest businesses.
    const lat = Number(q.lat);
    const long = Number(q.long);
    if (q.lat && q.long && Number.isFinite(lat) && Number.isFinite(long)) {
      const vote = voteNearestAuthority(await this.getBusinessPoints(), lat, long);
      if (vote && byId.has(vote.authorityId)) return result(vote.authorityId, 'nearby');
    }

    // 4. Ask the model which authority covers the address.
    if (this.ai && (q.city || q.address)) {
      try {
        const answer = await this.callModel<{ authorityId?: string }>(
          `You know Israeli local government. Given an address, choose the local authority
(municipality, local council or regional council) whose jurisdiction contains it, from the list below.
If none of them covers it, return "none".
${authorities.map(a => `${a.id} = ${a.name}`).join('\n')}`,
          JSON.stringify({ address: q.address ?? '', city: q.city ?? '' }),
          {
            type: 'object',
            properties: {
              authorityId: { type: 'string', enum: [...authorities.map(a => a.id), 'none'] },
            },
            required: ['authorityId'],
          },
        );
        if (answer.authorityId && byId.has(answer.authorityId)) {
          return result(answer.authorityId, 'ai');
        }
      } catch {
        // fall through to "none"
      }
    }
    return result(null, 'none');
  }

  private async getBusinessPoints() {
    if (this.pointsCache && Date.now() - this.pointsCache.at < CACHE_MS) {
      return this.pointsCache.value;
    }
    const rows = await this.BusinessModel.find({
      isDeleted: { $ne: true },
      authorityId: { $ne: null },
      'geoLocation.lat': { $nin: [null, ''] },
    }).select('authorityId geoLocation').lean();
    const value = rows.flatMap((b: any) => {
      const lat = Number(b.geoLocation?.lat);
      const long = Number(b.geoLocation?.long);
      return Number.isFinite(lat) && Number.isFinite(long) && (lat || long)
        ? [{ authorityId: String(b.authorityId), lat, long }]
        : [];
    });
    this.pointsCache = { at: Date.now(), value };
    return value;
  }
}
