import { initTRPC, TRPCError } from '@trpc/server';
import type { OpenApiMeta } from 'trpc-openapi';
import { appConfig } from './config.js';
import type { AppContext } from './context.js';

const t = initTRPC
  .context<AppContext>()
  .meta<OpenApiMeta>()
  .create({
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          stack: appConfig.nodeEnv === 'production' ? undefined : error.stack,
        },
      };
    },
  });

const enforceModerator = t.middleware(({ ctx, next }) => {
  if (!ctx.isModerator) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Moderator access required.',
    });
  }
  return next({ ctx });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const moderatorProcedure = t.procedure.use(enforceModerator);
