import { config } from 'dotenv';
import { z } from 'zod';

config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),
  WC_BASE_URL: z.string().url(),
  WC_CONSUMER_KEY: z.string().optional(),
  WC_CONSUMER_SECRET: z.string().optional(),
  WC_USE_STORE_API: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
  WP_BASE_URL: z.string().url().optional(),
  WP_APP_USERNAME: z.string().optional(),
  WP_APP_PASSWORD: z.string().optional(),
  WP_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openai/gpt-4o-mini'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid backend environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
