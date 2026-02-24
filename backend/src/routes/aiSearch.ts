import { Router } from 'express';
import { z } from 'zod';
import { runAiSearch } from '../services/aiSearch.js';

const searchBodySchema = z.object({
  query: z.string().trim().min(2),
  limit: z.number().int().min(1).max(12).optional(),
  filters: z
    .object({
      category: z.string().trim().optional(),
      budgetMin: z.number().nonnegative().optional(),
      budgetMax: z.number().nonnegative().optional(),
      inStockOnly: z.boolean().optional(),
    })
    .optional(),
});

export const aiSearchRouter = Router();

aiSearchRouter.post('/', async (req, res, next) => {
  try {
    const body = searchBodySchema.parse(req.body);
    const result = await runAiSearch(body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
