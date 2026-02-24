import { env } from '../env.js';
import { mapWooProduct, type WooProductInput } from './productMapper.js';
import { fetchWooProducts } from './woo.js';
import { parseQuery } from './aiQueryParser.js';
import type { AiRecommendation, AiSearchRequest, AiSearchResponse } from '../types/aiSearch.js';
import type { Product } from '../types.js';

interface CatalogCache {
  expiresAt: number;
  products: Product[];
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_PAGES = 10;
const PAGE_SIZE = 100;

let catalogCache: CatalogCache | null = null;

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function productText(product: Product): string {
  return [
    product.name,
    product.categories.join(' '),
    stripHtml(product.shortDescription),
    stripHtml(product.description),
  ]
    .join(' ')
    .toLowerCase();
}

function scoreProduct(product: Product, queryTokens: string[], query: string): number {
  if (queryTokens.length === 0) return 0;
  const haystack = productText(product);
  let score = 0;

  for (const token of queryTokens) {
    if (product.name.toLowerCase().includes(token)) score += 10;
    if (product.categories.some((category) => category.toLowerCase().includes(token))) score += 6;
    if (haystack.includes(token)) score += 2;
  }

  if (query.includes('cheap') || query.includes('budget') || query.includes('affordable')) {
    score += Math.max(0, 5 - product.price / 100000);
  }
  if (query.includes('premium') || query.includes('best') || query.includes('quality')) {
    score += Math.min(5, product.price / 150000);
  }
  if (product.inStock) score += 1;
  if (product.hot) score += 0.5;

  return score;
}

function buildFallbackWhy(product: Product): string {
  const category = product.categories[0] ?? 'general use';
  return `${product.name} is a strong match in ${category} with current pricing and availability.`;
}

function pickFollowUps(query: string): string[] {
  const questions: string[] = [];
  if (!/(under|below|less|budget|above|over|\d)/i.test(query)) {
    questions.push('What budget range should I target for you?');
  }
  if (!/(brand|apple|samsung|nike|hp|lenovo|infinix|tecno)/i.test(query)) {
    questions.push('Do you prefer any specific brand?');
  }
  if (!/(size|inch|gb|tb|ram|color|battery|camera)/i.test(query)) {
    questions.push('Any required specs like size, storage, or performance?');
  }
  return questions.slice(0, 3);
}

async function fetchFullCatalog(): Promise<Product[]> {
  const now = Date.now();
  if (catalogCache && catalogCache.expiresAt > now) {
    return catalogCache.products;
  }

  const products: Product[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const raw = await fetchWooProducts({ page, perPage: PAGE_SIZE });
    const mapped = raw.map((item) => mapWooProduct(item as WooProductInput));
    products.push(...mapped);

    if (mapped.length < PAGE_SIZE) break;
  }

  catalogCache = {
    products,
    expiresAt: now + CACHE_TTL_MS,
  };
  return products;
}

function applyFilters(products: Product[], filters: AiSearchRequest['filters']): Product[] {
  if (!filters) return products;
  return products.filter((product) => {
    if (filters.category && !product.categories.includes(filters.category)) return false;
    if (filters.inStockOnly && !product.inStock) return false;
    if (typeof filters.budgetMin === 'number' && product.price < filters.budgetMin) return false;
    if (typeof filters.budgetMax === 'number' && product.price > filters.budgetMax) return false;
    return true;
  });
}

function parseAiJson(content: string): { insights?: string; followUpQuestions?: string[]; reasons?: Record<string, string> } | null {
  const trimmed = content.trim();
  const blockMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonText = blockMatch ? blockMatch[0] : trimmed;
  try {
    return JSON.parse(jsonText) as { insights?: string; followUpQuestions?: string[]; reasons?: Record<string, string> };
  } catch {
    return null;
  }
}

async function generateAiInsight(
  query: string,
  candidates: AiRecommendation[],
  categories: string[],
): Promise<{ insights: string; followUpQuestions: string[]; reasons: Record<string, string> }> {
  if (!env.OPENROUTER_API_KEY || candidates.length === 0) {
    return {
      insights: 'I matched products based on your intent, budget, category fit, and availability in our store.',
      followUpQuestions: pickFollowUps(query),
      reasons: {},
    };
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are an ecommerce sales assistant. Recommend only from provided products. Reply with strict JSON: {"insights":"...","followUpQuestions":["..."],"reasons":{"productId":"reason"}}.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            query,
            categories,
            candidateProducts: candidates.map((product) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              inStock: product.inStock,
              categories: product.categories,
              shortDescription: stripHtml(product.shortDescription).slice(0, 280),
              description: stripHtml(product.description).slice(0, 420),
            })),
          }),
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${message}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content ?? '';
  const parsed = parseAiJson(content);

  if (!parsed) {
    return {
      insights: 'I found options that best match your request from our store catalog.',
      followUpQuestions: pickFollowUps(query),
      reasons: {},
    };
  }

  return {
    insights: parsed.insights ?? 'I found options that best match your request from our store catalog.',
    followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions.slice(0, 3) : pickFollowUps(query),
    reasons: parsed.reasons ?? {},
  };
}

export async function runAiSearch(input: AiSearchRequest): Promise<AiSearchResponse> {
  const limit = Math.min(Math.max(input.limit ?? 6, 1), 12);
  const catalog = await fetchFullCatalog();
  const categories = Array.from(
    new Set(
      catalog.flatMap((product) => product.categories).filter((category) => category && category.toLowerCase() !== 'all'),
    ),
  );

  const parsed = parseQuery(input.query, categories);
  const mergedFilters = {
    ...parsed.filters,
    ...(input.filters ?? {}),
  };

  const filtered = applyFilters(catalog, mergedFilters);
  const tokens = parsed.intent.detectedNeeds;

  const ranked = filtered
    .map((product) => ({ product, score: scoreProduct(product, tokens, parsed.intent.normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const recommendations: AiRecommendation[] = ranked.map(({ product, score }) => ({
    ...product,
    score: Number(score.toFixed(2)),
    why: buildFallbackWhy(product),
  }));

  let insights = 'I found options from our store that best match your request.';
  let followUpQuestions = pickFollowUps(input.query);

  try {
    const ai = await generateAiInsight(input.query, recommendations, categories);
    insights = ai.insights;
    followUpQuestions = ai.followUpQuestions;
    for (const recommendation of recommendations) {
      if (ai.reasons[recommendation.id]) {
        recommendation.why = ai.reasons[recommendation.id];
      }
    }
  } catch {
    // Fall back to deterministic recommendations if OpenRouter is unavailable.
  }

  return {
    intent: parsed.intent,
    filters: mergedFilters,
    insights,
    followUpQuestions,
    recommendations,
    totalCatalogSize: catalog.length,
  };
}
