import { z } from 'zod';
import {
  aiSuggestionsInputSchema,
  aiSuggestionsResponseSchema,
  bulkImportInputSchema,
  saveAiSuggestionInputSchema,
  saveAiSuggestionResponseSchema,
  bulkImportResponseSchema,
  contributionHistoryResponseSchema,
  feedbackVoteInputSchema,
  feedbackVoteResponseSchema,
  flagEquivalentInputSchema,
  flagEquivalentResponseSchema,
  moderationActionInputSchema,
  moderationActionResponseSchema,
  moderationLogInputSchema,
  moderationLogResponseSchema,
  moderationQueueInputSchema,
  moderationQueueResponseSchema,
  searchEquivalentsInputSchema,
  searchEquivalentsResponseSchema,
  sessionInfoSchema,
  submitEquivalentInputSchema,
  submitEquivalentResponseSchema,
  translateMissingResponseSchema,
} from './contracts.js';
import { generateAiSuggestions } from './ai-valuation.js';
import { appConfig } from './config.js';
import { serverT } from './i18n.js';
import { importEquivalents } from './db/import.js';
import { flagEquivalent, getModerationLog, getModerationQueue, moderateEquivalent } from './db/moderation.js';
import { getContributionHistory, saveAiSuggestion, searchEquivalents, submitEquivalent, submitFeedback } from './db/repository.js';
import { translatePendingEntries } from './translate.js';
import { moderatorProcedure, publicProcedure, router } from './trpc.js';

export const appRouter = router({
  session: router({
    get: publicProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/session',
          tags: ['session'],
          summary: 'Get the current anonymous session',
        },
      })
      .input(z.void())
      .output(sessionInfoSchema)
      .query(({ ctx }) => ctx.session),
  }),
  equivalents: router({
    search: publicProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/equivalents/search',
          tags: ['equivalents'],
          summary: 'Search approved barter equivalents',
        },
      })
      .input(searchEquivalentsInputSchema)
      .output(searchEquivalentsResponseSchema)
      .query(({ ctx, input }) => searchEquivalents(input.search, ctx.lang, input.page, input.pageSize)),
    submit: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/equivalents',
          tags: ['equivalents'],
          summary: 'Submit a new barter equivalent',
        },
      })
      .input(submitEquivalentInputSchema)
      .output(submitEquivalentResponseSchema)
      .mutation(({ ctx, input }) => submitEquivalent(ctx.session.sessionId, input, ctx.lang)),
  }),
  ai: router({
    suggestions: publicProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/ai/suggestions',
          tags: ['ai'],
          summary: 'Get AI-generated barter suggestions (when no community data exists)',
        },
      })
      .input(aiSuggestionsInputSchema)
      .output(aiSuggestionsResponseSchema)
      .query(async ({ ctx, input }) => {
        if (!appConfig.openRouterApiKey) {
          return { suggestions: [], message: null };
        }
        const suggestions = await generateAiSuggestions(input.query, ctx.lang);
        return {
          suggestions,
          message: suggestions.length > 0 ? serverT(ctx.lang, 'search.aiSuggestions') : null,
        };
      }),
    save: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/ai/save',
          tags: ['ai'],
          summary: 'Save an AI suggestion as a pending equivalent',
        },
      })
      .input(saveAiSuggestionInputSchema)
      .output(saveAiSuggestionResponseSchema)
      .mutation(({ input }) => saveAiSuggestion(input)),
  }),
  contributions: router({
    history: publicProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/contributions',
          tags: ['contributions'],
          summary: 'Get contribution history for the current session',
        },
      })
      .input(z.void())
      .output(contributionHistoryResponseSchema)
      .query(({ ctx }) => getContributionHistory(ctx.session.sessionId, ctx.lang)),
  }),
  feedback: router({
    vote: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/feedback',
          tags: ['feedback'],
          summary: 'Submit helpful or not helpful feedback',
        },
      })
      .input(feedbackVoteInputSchema)
      .output(feedbackVoteResponseSchema)
      .mutation(({ ctx, input }) => submitFeedback(ctx.session.sessionId, input, ctx.lang)),
  }),
  flags: router({
    create: publicProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/flags',
          tags: ['flags'],
          summary: 'Flag an equivalent for moderator review',
        },
      })
      .input(flagEquivalentInputSchema)
      .output(flagEquivalentResponseSchema)
      .mutation(({ ctx, input }) => flagEquivalent(ctx.session.sessionId, input, ctx.lang)),
  }),
  moderation: router({
    queue: moderatorProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/moderation/queue',
          tags: ['moderation'],
          summary: 'Get the moderation queue (moderator only)',
        },
      })
      .input(moderationQueueInputSchema)
      .output(moderationQueueResponseSchema)
      .query(({ ctx, input }) => getModerationQueue(input, ctx.lang)),
    action: moderatorProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/moderation/action',
          tags: ['moderation'],
          summary: 'Approve or reject an equivalent (moderator only)',
        },
      })
      .input(moderationActionInputSchema)
      .output(moderationActionResponseSchema)
      .mutation(({ ctx, input }) => moderateEquivalent(ctx.session.sessionId, input, ctx.lang)),
    log: moderatorProcedure
      .meta({
        openapi: {
          method: 'GET',
          path: '/moderation/log',
          tags: ['moderation'],
          summary: 'View moderation audit log (moderator only)',
        },
      })
      .input(moderationLogInputSchema)
      .output(moderationLogResponseSchema)
      .query(({ input }) => getModerationLog(input)),
    translate: moderatorProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/moderation/translate',
          tags: ['moderation'],
          summary: 'Translate entries with missing bilingual data (moderator only)',
        },
      })
      .input(z.void())
      .output(translateMissingResponseSchema)
      .mutation(async () => {
        const result = await translatePendingEntries();
        return {
          ...result,
          message: result.translated > 0
            ? `Translated ${result.translated} entries. ${result.remaining} remaining.`
            : result.remaining > 0
              ? `No translations completed. ${result.remaining} entries still need translation.`
              : 'All entries are fully translated.',
        };
      }),
    import: moderatorProcedure
      .meta({
        openapi: {
          method: 'POST',
          path: '/moderation/import',
          tags: ['moderation'],
          summary: 'Bulk import official equivalents (moderator only)',
        },
      })
      .input(bulkImportInputSchema)
      .output(bulkImportResponseSchema)
      .mutation(({ input }) => importEquivalents(input)),
  }),
});

export type AppRouter = typeof appRouter;
