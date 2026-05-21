import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { normalizeHebrewSearch } from 'src/core/helper/atlas-search.util';

const cache = new Map<string, { terms: string[]; expires: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Uses Gemini to expand a search term into ~10 semantically related words.
 */
export async function expandSearchTerms(
  search: string,
  apiKey: string,
): Promise<string[]> {
  if (!apiKey) return [search];

  const cacheKey = search.trim();
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    // console.log('[Search Expansion] cache hit for:', search, '→', cached.terms);
    return cached.terms;
  }

  const ai = new GoogleGenAI({ apiKey });

  const attempt = async (n: number): Promise<string[]> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Search keyword: "${search}"`,
        config: {
          systemInstruction: `You are a search query expansion assistant for a Hebrew marketplace app.

Given a search keyword, return exactly 10 search terms that cover the same concept so a user can find matching products.

HEBREW MORPHOLOGY NOTE: Hebrew singular and plural are completely different words — not just adding a letter.
Examples: "ילד" (child) → "ילדים" (children), "ספר" (book) → "ספרים" (books), "תפוח" (apple) → "תפוחים" (apples), "מסעדה" (restaurant) → "מסעדות" (restaurants).
You MUST include both the singular and plural Hebrew form of the main concept.

Rules:
1. Always include both Hebrew singular AND plural of the main word.
2. Include Hebrew synonyms and closely related concepts.
3. CRITICAL: Avoid extremely generic single-word terms like "עץ" (wood/tree), "פרי" (fruit), "אוכל" (food), or "בית" (house) unless they are the exact search term.
4. If input is Hebrew -> also add English equivalents; if input is English -> also add Hebrew equivalents.
5. Plain Hebrew letters only - absolutely NO nikud/diacritics.
6. Return ONLY a flat JSON array of strings`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'array',
            items: { type: 'string' },
          },
          temperature: 0.3,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });

      const expanded: string[] = JSON.parse(response.text || '[]');

      // Strip nikud from every returned term regardless of what Gemini outputs
      const cleaned = expanded
        .map(t => normalizeHebrewSearch(t))
        .filter(Boolean);

      // Blocklist of extremely generic words that cause false positives
      const blocklist = new Set([
        'פרי',
        'פירות',
        'עץ',
        'אוכל',
        'מזון',
        'בית',
        'מרכז',
      ]);

      const allTerms = [normalizeHebrewSearch(search), ...cleaned]
        .filter(t => !blocklist.has(t) || t === normalizeHebrewSearch(search)) // Allow if it was the original search
        .filter((t, i, arr) => t && arr.indexOf(t) === i) // Deduplicate AFTER everything is combined and normalized
        .slice(0, 6); // Limit to top 6 terms for precision

      cache.set(cacheKey, {
        terms: allTerms,
        expires: Date.now() + CACHE_TTL_MS,
      });
      // console.log('[Search Expansion] original:', search, '→', allTerms);
      return allTerms;
    } catch (error: any) {
      if ((error.status === 503 || error.status === 429) && n < 3) {
        await sleep(2 ** n * 1000);
        // eslint-disable-next-line no-restricted-properties
        await sleep(Math.pow(2, n) * 1000);
        return attempt(n + 1);
      }
      console.warn(
        '[Search Expansion] Gemini failed, falling back to original term:',
        error?.message,
      );
      return [normalizeHebrewSearch(search)];
    }
  };

  return attempt(1);
}
