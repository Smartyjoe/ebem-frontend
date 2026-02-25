import { Router } from 'express';
import { z } from 'zod';
import { mapWooProduct, type WooProductInput } from '../services/productMapper.js';
import { fetchWooProductByReference, fetchWooProducts } from '../services/woo.js';
import type { ProductsResponse } from '../types.js';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(50).default(24),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  featured: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

export const productsRouter = Router();

productsRouter.get('/', async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const rawProducts = await fetchWooProducts({
      page: query.page,
      perPage: query.perPage,
      search: query.search,
      category: query.category,
      featured: query.featured,
    });

    const products = rawProducts.map((product) => mapWooProduct(product as WooProductInput));
    const categorySet = new Set<string>();
    for (const product of products) {
      for (const category of product.categories) {
        categorySet.add(category);
      }
    }

    const payload: ProductsResponse = {
      items: products,
      categories: ['All', ...Array.from(categorySet).sort((a, b) => a.localeCompare(b))],
      page: query.page,
      perPage: query.perPage,
      hasMore: products.length === query.perPage,
    };

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/featured', async (req, res, next) => {
  try {
    const perPage = z.coerce.number().int().positive().max(20).default(8).parse(req.query.limit);
    const rawProducts = await fetchWooProducts({
      page: 1,
      perPage,
      featured: true,
    });

    const products = rawProducts.map((product) => mapWooProduct(product as WooProductInput));
    res.json({ items: products.slice(0, perPage) });
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:reference', async (req, res, next) => {
  try {
    const reference = z.string().trim().min(1).parse(req.params.reference);
    const rawProduct = await fetchWooProductByReference(reference);

    if (!rawProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = mapWooProduct(rawProduct as WooProductInput);
    res.json(product);
  } catch (error) {
    next(error);
  }
});
