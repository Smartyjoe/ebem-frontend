import type { Product } from '../types.js';

interface WooCategory {
  name?: string;
}

interface WooImage {
  src?: string;
}

interface WooStorePrices {
  price?: string;
  regular_price?: string;
  currency_minor_unit?: number | string;
}

export interface WooProductInput {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  categories?: WooCategory[];
  images?: WooImage[];
  price?: string;
  regular_price?: string;
  prices?: WooStorePrices;
  stock_status?: string;
  featured?: boolean;
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toMinorUnitDivisor(minorUnit: number | string | undefined): number {
  const parsed = typeof minorUnit === 'number' ? minorUnit : Number.parseInt(minorUnit ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 6) return 1;
  return 10 ** parsed;
}

function resolvePrices(raw: WooProductInput): { price: number; regularPrice: number } {
  // REST API shape (wc/v3) exposes major-unit prices directly.
  const restPrice = toNumber(raw.price);
  const restRegularPrice = toNumber(raw.regular_price);

  // Store API shape (wc/store/v1) exposes prices in minor units within raw.prices.
  if (raw.prices) {
    const divisor = toMinorUnitDivisor(raw.prices.currency_minor_unit);
    const hasStorePrice = typeof raw.prices.price === 'string';
    const hasStoreRegularPrice = typeof raw.prices.regular_price === 'string';

    const storePrice = hasStorePrice ? toNumber(raw.prices.price) / divisor : restPrice;
    const storeRegularPrice = hasStoreRegularPrice ? toNumber(raw.prices.regular_price) / divisor : restRegularPrice;

    return {
      price: storePrice,
      regularPrice: storeRegularPrice,
    };
  }

  return {
    price: restPrice,
    regularPrice: restRegularPrice,
  };
}

export function mapWooProduct(raw: WooProductInput): Product {
  const categories = (raw.categories ?? []).map((category) => category.name).filter(Boolean) as string[];
  const imageList = (raw.images ?? []).map((image) => image.src).filter(Boolean) as string[];
  const { price, regularPrice } = resolvePrices(raw);
  const onSale = regularPrice > 0 && regularPrice > price;
  const inStock = raw.stock_status === 'instock';

  return {
    id: String(raw.id),
    name: raw.name ?? 'Untitled Product',
    slug: raw.slug ?? String(raw.id),
    description: raw.description ?? '',
    shortDescription: raw.short_description ?? '',
    image: imageList[0] ?? 'https://placehold.co/600x750?text=No+Image',
    images: imageList,
    category: categories[0] ?? 'General',
    categories,
    price,
    originalPrice: onSale ? regularPrice : null,
    badge: inStock ? 'Ready Stock' : 'Pre-Order',
    hot: Boolean(raw.featured),
    inStock,
  };
}
