export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  category: string;
  categories: string[];
  price: number;
  originalPrice: number | null;
  badge: 'Ready Stock' | 'Pre-Order';
  hot: boolean;
  inStock: boolean;
}

export interface ProductsResponse {
  items: Product[];
  categories: string[];
  page: number;
  perPage: number;
  hasMore: boolean;
}
