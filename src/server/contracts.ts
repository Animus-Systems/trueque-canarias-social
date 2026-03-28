import { z } from 'zod';

export const statusSchema = z.enum(['pending', 'approved', 'rejected']);
export const voteTypeSchema = z.enum(['helpful', 'not_helpful']);
export const sourceTypeSchema = z.enum(['official', 'community', 'ai_suggested']);
export const unitSchema = z.enum(['hour', 'kg', 'unit', 'dozen', 'liter']);

export const sessionInfoSchema = z.object({
  sessionId: z.string().uuid(),
  reputation: z.number().int().nonnegative(),
});

export const equivalentSummarySchema = z.object({
  id: z.string().uuid(),
  skillName: z.string(),
  itemName: z.string(),
  ratio: z.number().positive(),
  offerUnit: unitSchema.optional().default('hour'),
  receiveUnit: unitSchema.optional().default('hour'),
  description: z.string(),
  status: statusSchema,
  helpfulVotes: z.number().int().nonnegative(),
  notHelpfulVotes: z.number().int().nonnegative(),
  confidenceScore: z.number().int().min(0).max(100),
  createdAt: z.string(),
  displayFormat: z.string(),
  flaggedCount: z.number().int().nonnegative().optional(),
  rejectionReason: z.string().nullable().optional(),
  bananaValue: z.number().positive().nullable().optional(),
  bananaDisplayFormat: z.string().nullable().optional(),
  sourceType: sourceTypeSchema.optional(),
  sourceAttribution: z.string().nullable().optional(),
});

export const searchEquivalentsInputSchema = z.object({
  search: z.string().trim().max(120).optional().default(''),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
});

export const aiSuggestionSchema = z.object({
  skillNameEn: z.string(),
  skillNameEs: z.string(),
  itemNameEn: z.string(),
  itemNameEs: z.string(),
  ratio: z.number().positive(),
  offerUnit: unitSchema.default('hour'),
  receiveUnit: unitSchema.default('hour'),
  bananaValue: z.number().positive().nullable(),
  descriptionEn: z.string(),
  descriptionEs: z.string(),
  displayFormat: z.string(),
  bananaDisplayFormat: z.string().nullable(),
});

export const saveAiSuggestionInputSchema = z.object({
  skillNameEn: z.string().trim().min(1).max(120),
  skillNameEs: z.string().trim().min(1).max(120),
  itemNameEn: z.string().trim().min(1).max(120),
  itemNameEs: z.string().trim().min(1).max(120),
  ratio: z.number().positive().max(9999),
  offerUnit: unitSchema.optional().default('hour'),
  receiveUnit: unitSchema.optional().default('hour'),
  bananaValue: z.number().positive().max(9999).nullable(),
  descriptionEn: z.string().trim().min(1).max(600),
  descriptionEs: z.string().trim().min(1).max(600),
});

export const saveAiSuggestionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const searchEquivalentsResponseSchema = z.object({
  items: z.array(equivalentSummarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalPages: z.number().int().nonnegative(),
  message: z.string().nullable(),
  isComplexQuery: z.boolean().optional(),
});

export const aiSuggestionsInputSchema = z.object({
  query: z.string().trim().min(1).max(120),
});

export const aiSuggestionsResponseSchema = z.object({
  suggestions: z.array(aiSuggestionSchema),
  message: z.string().nullable(),
});

export const submitEquivalentInputSchema = z.object({
  skillName: z.string().trim().min(1, 'Skill name is required').max(120),
  itemName: z.string().trim().min(1, 'Item name is required').max(120),
  ratio: z.number().positive().max(9999),
  offerUnit: unitSchema.optional().default('hour'),
  receiveUnit: unitSchema.optional().default('hour'),
  description: z.string().trim().min(1, 'Description is required').max(600),
  bananaValue: z.number().positive().max(9999).nullable().optional(),
});

export const submitEquivalentResponseSchema = z.object({
  success: z.boolean(),
  status: statusSchema.nullable(),
  message: z.string().nullable(),
  warning: z.string().nullable(),
  reputation: z.number().int().nonnegative(),
  contribution: equivalentSummarySchema.nullable(),
});

export const contributionHistoryResponseSchema = z.object({
  contributions: z.array(equivalentSummarySchema),
  total: z.number().int().nonnegative(),
});

export const feedbackVoteInputSchema = z.object({
  equivalentId: z.string().uuid(),
  voteType: voteTypeSchema,
  reason: z.string().trim().max(300).optional(),
});

export const feedbackVoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().nullable(),
  newScore: z.number().int().min(0).max(100).nullable(),
  helpfulVotes: z.number().int().nonnegative().nullable(),
  notHelpfulVotes: z.number().int().nonnegative().nullable(),
  promptContext: z.string().nullable(),
});

// --- Flagging schemas ---

export const flagEquivalentInputSchema = z.object({
  equivalentId: z.string().uuid(),
  reason: z.string().trim().min(5, 'Please explain why you are flagging this').max(300),
});

export const flagEquivalentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().nullable(),
  autoRejected: z.boolean(),
});

// --- Moderation schemas ---

export const rejectionReasonSchema = z.enum([
  'inaccurate_ratio',
  'inappropriate',
  'duplicate',
  'insufficient_info',
  'other',
]);

export const translateMissingResponseSchema = z.object({
  translated: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
  message: z.string(),
});

export const moderationActionSchema = z.enum(['approve', 'reject']);

export const moderationActionInputSchema = z.object({
  equivalentId: z.string().uuid(),
  action: moderationActionSchema,
  reason: rejectionReasonSchema.optional(),
  notes: z.string().trim().max(500).optional(),
});

export const moderationActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().nullable(),
});

export const moderationQueueInputSchema = z.object({
  status: statusSchema.optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export const moderationQueueResponseSchema = z.object({
  items: z.array(equivalentSummarySchema),
  total: z.number().int().nonnegative(),
});

export const moderationLogEntrySchema = z.object({
  id: z.string().uuid(),
  equivalentId: z.string().uuid(),
  action: z.enum(['approved', 'rejected', 'auto_rejected']),
  performedBy: z.string().uuid().nullable(),
  reason: z.string().nullable(),
  previousStatus: statusSchema,
  newStatus: statusSchema,
  createdAt: z.string(),
});

export const moderationLogInputSchema = z.object({
  equivalentId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export const moderationLogResponseSchema = z.object({
  entries: z.array(moderationLogEntrySchema),
  total: z.number().int().nonnegative(),
});

// --- Bulk import schemas ---

export const bulkImportEntrySchema = z.object({
  skillNameEn: z.string().trim().min(1).max(120),
  skillNameEs: z.string().trim().min(1).max(120),
  itemNameEn: z.string().trim().min(1).max(120),
  itemNameEs: z.string().trim().min(1).max(120),
  ratio: z.number().positive().max(9999),
  offerUnit: unitSchema.optional().default('hour'),
  receiveUnit: unitSchema.optional().default('hour'),
  bananaValue: z.number().positive().max(9999).nullable().optional(),
  descriptionEn: z.string().trim().min(1).max(600),
  descriptionEs: z.string().trim().min(1).max(600),
  sourceAttribution: z.string().trim().max(200).optional(),
});

export const bulkImportInputSchema = z.object({
  entries: z.array(bulkImportEntrySchema).min(1).max(100),
});

export const bulkImportResponseSchema = z.object({
  imported: z.number().int().nonnegative(),
  skipped: z.number().int().nonnegative(),
  message: z.string(),
});

// --- Type exports ---

export type SessionInfo = z.infer<typeof sessionInfoSchema>;
export type EquivalentSummary = z.infer<typeof equivalentSummarySchema>;
export type SearchEquivalentsResponse = z.infer<typeof searchEquivalentsResponseSchema>;
export type SubmitEquivalentInput = z.infer<typeof submitEquivalentInputSchema>;
export type SubmitEquivalentResponse = z.infer<typeof submitEquivalentResponseSchema>;
export type ContributionHistoryResponse = z.infer<typeof contributionHistoryResponseSchema>;
export type FeedbackVoteInput = z.infer<typeof feedbackVoteInputSchema>;
export type FeedbackVoteResponse = z.infer<typeof feedbackVoteResponseSchema>;
export type FlagEquivalentInput = z.infer<typeof flagEquivalentInputSchema>;
export type FlagEquivalentResponse = z.infer<typeof flagEquivalentResponseSchema>;
export type ModerationActionInput = z.infer<typeof moderationActionInputSchema>;
export type ModerationActionResponse = z.infer<typeof moderationActionResponseSchema>;
export type ModerationQueueInput = z.infer<typeof moderationQueueInputSchema>;
export type ModerationQueueResponse = z.infer<typeof moderationQueueResponseSchema>;
export type ModerationLogEntry = z.infer<typeof moderationLogEntrySchema>;
export type ModerationLogInput = z.infer<typeof moderationLogInputSchema>;
export type ModerationLogResponse = z.infer<typeof moderationLogResponseSchema>;
export type TranslateMissingResponse = z.infer<typeof translateMissingResponseSchema>;
export type BarterUnit = z.infer<typeof unitSchema>;
export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;
export type AiSuggestionsResponse = z.infer<typeof aiSuggestionsResponseSchema>;
export type BulkImportEntry = z.infer<typeof bulkImportEntrySchema>;
export type BulkImportInput = z.infer<typeof bulkImportInputSchema>;
export type BulkImportResponse = z.infer<typeof bulkImportResponseSchema>;
