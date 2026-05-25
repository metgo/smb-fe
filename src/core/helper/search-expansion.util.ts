import { GoogleGenAI } from '@google/genai';
import {
  normalizeHebrewSearch,
  normalizeArabicSearch,
} from 'src/core/helper/atlas-search.util';

const cache = new Map<string, { terms: string[]; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const GEMINI_TIMEOUT_MS = 5000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Matches any Hebrew letter (U+05D0–U+05EA)
export const HEBREW_CHAR_RE = /[א-ת]/;

/** Strips Hebrew nikud AND Arabic tashkeel from a term. */
function normalizeTerm(text: string): string {
  return normalizeArabicSearch(normalizeHebrewSearch(text));
}

interface ExpandedSearchResponse {
  terms: string[];
  morphological: string[];
  parents: string[];
}

/** Calls Gemini, caches the result, and returns the expanded term list. */
async function runGemini(
  search: string,
  apiKey: string,
  cacheKey: string,
): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey });

  const attempt = async (n: number): Promise<string[]> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search keyword: "${search}"`,
        config: {
          systemInstruction: `You are a search query expansion assistant for a trilingual marketplace (Hebrew, English, Arabic).

Given a search keyword in ANY language, return a JSON object with THREE keys:

"terms" → array of exactly 12 strings.
Identify 4 relevant concepts/variants for finding matching products.
For EACH concept provide one term in ALL THREE languages (Hebrew no nikud, English, Arabic no tashkeel).
Total: 4 × 3 = 12 strings.

"morphological" → singular + plural of each concept in all 3 languages (only if different from terms). Skip duplicates.

"parents" → if the term belongs to a broader product category, include it in all 3 languages (at most 1 parent level). Return [] if none.

RULES: No nikud. No tashkeel. Return ONLY the JSON object.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              terms: { type: 'array', items: { type: 'string' } },
              morphological: { type: 'array', items: { type: 'string' } },
              parents: { type: 'array', items: { type: 'string' } },
            },
            required: ['terms', 'morphological', 'parents'],
          },
          temperature: 0.1,
        },
      });

      const parsed: ExpandedSearchResponse = JSON.parse(response.text || '{}');

      const semanticTerms: string[] = Array.isArray(parsed.terms)
        ? parsed.terms
        : [];
      const morphTerms: string[] = Array.isArray(parsed.morphological)
        ? parsed.morphological
        : [];
      const parentTerms: string[] = Array.isArray(parsed.parents)
        ? parsed.parents
        : [];

      const blocklist = new Set([
        'פרי',
        'פירות',
        'עץ',
        'אוכל',
        'מזון',
        'בית',
        'מרכז',
        'food',
        'fruit',
        'house',
        'center',
        'product',
        'item',
        'thing',
        'طعام',
        'فاكهة',
        'بيت',
        'مركز',
        'شيء',
      ]);

      const normalizedSearch = normalizeTerm(search);

      const allTerms = [
        normalizedSearch,
        ...semanticTerms
          .map(t => normalizeTerm(t))
          .filter(t => t && (!blocklist.has(t) || t === normalizedSearch)),
        ...morphTerms.map(t => normalizeTerm(t)).filter(Boolean),
        ...parentTerms.map(t => normalizeTerm(t)).filter(Boolean),
      ].filter((t, i, arr) => t && arr.indexOf(t) === i);

      cache.set(cacheKey, {
        terms: allTerms,
        expires: Date.now() + CACHE_TTL_MS,
      });
      return allTerms;
    } catch (error: any) {
      if ((error.status === 503 || error.status === 429) && n < 3) {
        await sleep(2 ** n * 1000);
        return attempt(n + 1);
      }
      // eslint-disable-next-line no-console
      console.warn('[Search Expansion] Gemini failed:', error?.message);
      return [normalizeTerm(search)];
    }
  };

  return attempt(1);
}

export function getCachedExpansion(search: string): string[] | null {
  const cacheKey = search.trim();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.terms;
  return null;
}

export async function expandSearchTerms(
  search: string,
  apiKey: string,
): Promise<string[]> {
  if (!apiKey) return [search];

  const cacheKey = search.trim();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.terms;
  }

  const fallback = [normalizeTerm(search)];
  const geminiPromise = runGemini(search, apiKey, cacheKey);

  const winner = await Promise.race([
    geminiPromise,
    new Promise<null>(resolve => {
      setTimeout(() => resolve(null), GEMINI_TIMEOUT_MS);
    }),
  ]);

  if (winner === null) {
    // Timed out — let Gemini warm the cache in the background.
    geminiPromise.catch(() => {
      /* swallow */
    });
    return fallback;
  }

  return winner;
}
