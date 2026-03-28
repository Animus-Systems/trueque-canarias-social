import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../src/server/router';

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type SessionInfo = RouterOutputs['session']['get'];
export type SearchResponse = RouterOutputs['equivalents']['search'];
export type SearchItem = SearchResponse['items'][number];
export type HistoryResponse = RouterOutputs['contributions']['history'];
export type HistoryItem = HistoryResponse['contributions'][number];
export type FlagResponse = RouterOutputs['flags']['create'];
export type ModerationQueueResponse = RouterOutputs['moderation']['queue'];
export type ModerationQueueItem = ModerationQueueResponse['items'][number];
export type ModerationLogResponse = RouterOutputs['moderation']['log'];
export type ModerationLogEntry = ModerationLogResponse['entries'][number];
export type AiSuggestionsResponse = RouterOutputs['ai']['suggestions'];
export type AiSuggestion = AiSuggestionsResponse['suggestions'][number];
