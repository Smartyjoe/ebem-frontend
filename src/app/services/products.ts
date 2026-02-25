import { apiGet } from './api';
import type { Product, ProductsResponse } from '../types/product';

interface GetProductsArgs {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
}

function buildQuery(args: GetProductsArgs): string {
  const params = new URLSearchParams();
  if (args.page) params.set('page', String(args.page));
  if (args.perPage) params.set('perPage', String(args.perPage));
  if (args.search) params.set('search', args.search);
  if (args.category && args.category !== 'All') params.set('category', args.category);
  return params.toString() ? `?${params.toString()}` : '';
}

export function getProducts(args: GetProductsArgs = {}) {
  return apiGet<ProductsResponse>(`/products${buildQuery(args)}`);
}

export function getProductByReference(reference: string) {
  return apiGet<Product>(`/products/${encodeURIComponent(reference)}`);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const data = await apiGet<{ items: Product[] }>(`/products/featured?limit=${limit}`);
  return data.items;
}
