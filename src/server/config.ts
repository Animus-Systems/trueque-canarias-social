import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3003),
  DATABASE_URL: z
    .string()
    .startsWith('postgresql://')
    .default('postgresql://postgres:postgres@localhost:5433/trueque_canarias_social'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  APP_ORIGIN: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ADMIN_TOKEN: z.string().min(32).optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openai/gpt-4o-mini'),
  OPENROUTER_AI_MODEL: z.string().optional(),
  COOKIE_DOMAIN: z.string().optional(),
  DATABASE_CA_CERT: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;

export const appConfig = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  clientOrigin: env.CLIENT_ORIGIN,
  appOrigin: env.APP_ORIGIN ?? `http://localhost:${env.PORT}`,
  sessionCookieName: 'tcs_session_id',
  nodeEnv: env.NODE_ENV,
  adminToken: env.ADMIN_TOKEN ?? null,
  openRouterApiKey: env.OPENROUTER_API_KEY ?? null,
  openRouterModel: env.OPENROUTER_MODEL,
  openRouterAiModel: env.OPENROUTER_AI_MODEL ?? env.OPENROUTER_MODEL,
  cookieDomain: env.COOKIE_DOMAIN ?? undefined,
  databaseCaCert: env.DATABASE_CA_CERT ?? null,
};
