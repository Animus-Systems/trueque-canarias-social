import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { timingSafeEqual } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { appConfig } from './config.js';
import { ensureSession } from './db/repository.js';
import { parseLanguage, type ServerLang } from './i18n.js';

const uuidSchema = z.string().uuid();

function verifyAdminToken(provided: string): boolean {
  const expected = appConfig.adminToken;
  if (!expected) return false;
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function createContext({ req, res }: CreateExpressContextOptions) {
  const cookieValue = req.cookies?.[appConfig.sessionCookieName];
  const parsed = typeof cookieValue === 'string' ? uuidSchema.safeParse(cookieValue) : undefined;
  const existingSessionId = parsed?.success ? parsed.data : undefined;

  let session;
  try {
    session = await ensureSession(existingSessionId);
  } catch (error) {
    console.error('Failed to initialise session:', error instanceof Error ? error.message : error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unable to create session. Please try again later.',
    });
  }

  const lang: ServerLang = parseLanguage(req.headers['accept-language'] as string | undefined);

  const adminHeader = req.headers['x-admin-token'];
  const isModerator =
    typeof adminHeader === 'string' && adminHeader.length > 0
      ? verifyAdminToken(adminHeader)
      : false;

  const cookieOptions: {
    httpOnly: boolean;
    sameSite: 'lax' | 'none';
    secure: boolean;
    maxAge: number;
    domain?: string;
  } = {
    httpOnly: true,
    sameSite: 'lax',
    secure: appConfig.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };

  if (appConfig.cookieDomain) {
    cookieOptions.domain = appConfig.cookieDomain;
  }

  res.cookie(appConfig.sessionCookieName, session.sessionId, cookieOptions);

  return {
    req,
    res,
    session,
    isModerator,
    lang,
  };
}

export type AppContext = Awaited<ReturnType<typeof createContext>>;
