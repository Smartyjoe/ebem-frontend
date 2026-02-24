import type { Product } from '../types.js';

export interface AiSearchFilters {
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  inStockOnly?: boolean;
}

export interface AiSearchRequest {
  query: string;
  limit?: number;
  filters?: AiSearchFilters;
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
