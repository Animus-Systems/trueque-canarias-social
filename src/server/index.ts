import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createOpenApiExpressMiddleware } from 'trpc-openapi';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { appConfig } from './config.js';
import { createContext } from './context.js';
import { checkDatabaseHealth, closePool } from './db/pool.js';
import { openApiDocument } from './openapi.js';
import { appRouter } from './router.js';

const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(currentDir, '../../../dist/client');

app.use(
  cors({
    origin: [appConfig.clientOrigin, appConfig.appOrigin],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    const database = await checkDatabaseHealth();
    res.json({ ok: true, database });
  } catch (error) {
    res.status(500).json({
      ok: false,
      database: false,
      error: error instanceof Error ? error.message : 'Unexpected server error',
    });
  }
});

app.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.use(
  '/api',
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
    responseMeta() {
      return {};
    },
    onError({
      error,
      path,
    }: {
      error: Error;
      path?: string;
    }) {
      console.error(`OpenAPI request failed for ${path ?? 'unknown path'}:`, error);
    },
    maxBodySize: 1024 * 1024,
  })
);

if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.type('html').send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Trueque Canarias Social</title>
          <style>
            body { font-family: system-ui, sans-serif; margin: 0; padding: 48px 24px; background: #f5f1e8; color: #1f2937; }
            main { max-width: 720px; margin: 0 auto; background: white; border-radius: 24px; padding: 32px; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08); }
            code { background: rgba(15, 23, 42, 0.06); padding: 2px 6px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <main id="main-content">
            <h1>Trueque Canarias Social</h1>
            <p>The API server is running, but the React frontend has not been built yet.</p>
            <p>For development run <code>yarn dev</code>. For production build run <code>yarn build</code>.</p>
          </main>
        </body>
      </html>
    `);
  });
}

async function main(): Promise<void> {
  try {
    await checkDatabaseHealth();
    console.log('Database connection verified.');
  } catch (error) {
    console.error('Database is not reachable:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const server = app.listen(appConfig.port, () => {
    console.log(`Trueque Canarias Social running at ${appConfig.appOrigin}`);
  });

  function shutdown() {
    console.log('Shutting down gracefully…');
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
