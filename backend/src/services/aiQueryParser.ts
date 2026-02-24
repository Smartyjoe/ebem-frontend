import type { AiIntent, AiSearchFilters } from '../types/aiSearch.js';

const STOP_WORDS = new Set([
  'i',
  'need',
  'want',
  'a',
  'an',
  'the',
  'for',
  'with',
  'and',
  'or',
  'to',
  'my',
  'that',
  'is',
  'in',
  'on',
  'of',
  'at',
  'me',
  'you',
  'best',
  'good',
  'please',
]);

function parseAmount(value: string): number {
  const normalized = value.replace(/,/g, '').trim().toLowerCase();
  const multiplier = normalized.endsWith('m') ? 1_000_000 : normalized.endsWith('k') ? 1_000 : 1;
  const numeric = normalized.replace(/[km]$/, '');
  const parsed = Number.parseFloat(numeric);
  return Number.isFinite(parsed) ? parsed * multiplier : 0;
}

function extractBudget(query: string): Pick<AiSearchFilters, 'budgetMin' | 'budgetMax'> {
  const rangeMatch = query.match(/(\d[\d,.]*\s*[km]?)\s*(?:-|to)\s*(\d[\d,.]*\s*[km]?)/i);
  if (rangeMatch) {
    return {
      budgetMin: parseAmount(rangeMatch[1]),
      budgetMax: parseAmount(rangeMatch[2]),
    };
  }

  const underMatch = query.match(/(?:under|below|less than|max|within)\s*(?:ngn|naira|₦)?\s*(\d[\d,.]*\s*[km]?)/i);
  if (underMatch) {
    return { budgetMax: parseAmount(underMatch[1]) };
  }

  const overMatch = query.match(/(?:above|over|from|starting at|min|minimum)\s*(?:ngn|naira|₦)?\s*(\d[\d,.]*\s*[km]?)/i);
  if (overMatch) {
    return { budgetMin: parseAmount(overMatch[1]) };
  }

  return {};
}

export function parseQuery(query: string, categories: string[]): { intent: AiIntent; filters: AiSearchFilters } {
  const normalized = query.toLowerCase().trim();
  const budget = extractBudget(normalized);
  const categoryMatches = categories.filter((category) => normalized.includes(category.toLowerCase()));
  const needs = normalized
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));

  const inStockOnly = /(instock|in stock|ready stock|available now|urgent|immediately)/i.test(normalized);

  return {
    intent: {
      normalizedQuery: normalized,
      detectedCategories: categoryMatches,
      detectedNeeds: Array.from(new Set(needs)).slice(0, 10),
      budgetMin: budget.budgetMin,
      budgetMax: budget.budgetMax,
    },
    filters: {
      ...(categoryMatches[0] ? { category: categoryMatches[0] } : {}),
      ...budget,
      ...(inStockOnly ? { inStockOnly: true } : {}),
    },
  };
}
