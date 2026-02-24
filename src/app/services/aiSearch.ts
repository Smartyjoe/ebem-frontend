import { apiGet, API_BASE_URL } from './api';
import type { Product } from '../types/product';

export interface AiSearchFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  inStockOnly?: boolean;
}

export interface AiIntent {
  normalizedQuery: string;
  detectedCategories: string[];
  detectedNeeds: string[];
  budgetMin?: number;
  budgetMax?: number;
}

export interface AiRecommendation extends Product {
  why: string;
  score: number;
}

export interface AiSearchResponse {
  intent: AiIntent;
  filters: AiSearchFilters;
  insights: string;
  followUpQuestions: string[];
  recommendations: AiRecommendation[];
  totalCatalogSize: number;
}

export async function searchWithAi(query: string, limit = 6): Promise<AiSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, limit }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'AI search request failed');
  }

  return (await response.json()) as AiSearchResponse;
}

export function getHealth() {
  return apiGet<{ status: string }>('/health');
}
