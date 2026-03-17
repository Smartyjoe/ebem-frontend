import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './env';
import { productsRouter } from './routes/products';
import { aiSearchRouter } from './routes/aiSearch';
import { adminRequestsRouter } from './routes/adminRequests';

const app = express();

app.use(helmet());
const allowedOrigins = env.FRONTEND_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/ai/search', aiSearchRouter);
app.use('/api/v1', adminRequestsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  res.status(500).json({ error: message });
});

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});
