import type { Product } from '../types.js';

interface WooCategory {
  name?: string;
}

interface WooImage {
  src?: string;
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
  stock_status?: string;
  featured?: boolean;
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapWooProduct(raw: WooProductInput): Product {
  const categories = (raw.categories ?? []).map((category) => category.name).filter(Boolean) as string[];
  const imageList = (raw.images ?? []).map((image) => image.src).filter(Boolean) as string[];
  const price = toNumber(raw.price);
  const regularPrice = toNumber(raw.regular_price);
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
