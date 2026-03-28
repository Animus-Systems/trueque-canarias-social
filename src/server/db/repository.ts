import { randomUUID } from 'node:crypto';
import { TRPCError } from '@trpc/server';
import type {
  ContributionHistoryResponse,
  EquivalentSummary,
  FeedbackVoteInput,
  FeedbackVoteResponse,
  SearchEquivalentsResponse,
  SessionInfo,
  SubmitEquivalentInput,
  SubmitEquivalentResponse,
} from '../contracts.js';
import type { BarterUnit } from '../contracts.js';
import { formatBananaDisplayI18n, formatEquivalentI18n, serverT, type ServerLang } from '../i18n.js';
import { translatePendingEntries } from '../translate.js';
import pool, { isPostgresError, PG_UNIQUE_VIOLATION, withTransaction } from './pool.js';

export interface EquivalentRow {
  id: string;
  skill_name_en: string;
  skill_name_es: string;
  item_name_en: string;
  item_name_es: string;
  ratio: string;
  description_en: string;
  description_es: string;
  status: 'pending' | 'approved' | 'rejected';
  helpful_votes: number;
  not_helpful_votes: number;
  confidence_score: number;
  created_at: Date;
  flagged_count?: number;
  rejection_reason?: string | null;
  banana_value?: string | null;
  source_type?: 'official' | 'community' | 'ai_suggested';
  source_attribution?: string | null;
  offer_unit?: string;
  receive_unit?: string;
}

function localized(row: EquivalentRow, field: 'skill_name' | 'item_name' | 'description', lang: ServerLang): string {
  const primary = row[`${field}_${lang}`];
  if (primary) return primary;
  return row[`${field}_${lang === 'en' ? 'es' : 'en'}`];
}

interface SessionRow {
  id: string;
  reputation: number;
}

export function toEquivalentSummary(row: EquivalentRow, lang: ServerLang = 'en'): EquivalentSummary {
  const ratio = Number(row.ratio);
  const skillName = localized(row, 'skill_name', lang);
  const itemName = localized(row, 'item_name', lang);
  const description = localized(row, 'description', lang);
  const offerUnit = (row.offer_unit ?? 'hour') as BarterUnit;
  const receiveUnit = (row.receive_unit ?? 'hour') as BarterUnit;

  const summary: EquivalentSummary = {
    id: row.id,
    skillName,
    itemName,
    ratio,
    offerUnit,
    receiveUnit,
    description,
    status: row.status,
    helpfulVotes: row.helpful_votes,
    notHelpfulVotes: row.not_helpful_votes,
    confidenceScore: row.confidence_score,
    createdAt: row.created_at.toISOString(),
    displayFormat: formatEquivalentI18n(skillName, itemName, ratio, lang, offerUnit, receiveUnit),
  };

  if (row.flagged_count !== undefined) {
    summary.flaggedCount = row.flagged_count;
  }
  if (row.rejection_reason !== undefined) {
    summary.rejectionReason = row.rejection_reason ?? null;
  }
  if (row.banana_value !== undefined) {
    const bv = row.banana_value !== null ? Number(row.banana_value) : null;
    summary.bananaValue = bv;
    summary.bananaDisplayFormat = formatBananaDisplayI18n(bv, lang);
  }
  if (row.source_type !== undefined) {
    summary.sourceType = row.source_type;
  }
  if (row.source_attribution !== undefined) {
    summary.sourceAttribution = row.source_attribution ?? null;
  }

  return summary;
}

export function levenshteinDistance(left: string, right: string): number {
  const matrix = Array.from({ length: right.length + 1 }, () => Array<number>(left.length + 1).fill(0));

  for (let row = 0; row <= right.length; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column <= left.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= right.length; row += 1) {
    for (let column = 1; column <= left.length; column += 1) {
      if (right[row - 1] === left[column - 1]) {
        matrix[row][column] = matrix[row - 1][column - 1];
        continue;
      }

      matrix[row][column] = Math.min(
        matrix[row - 1][column - 1] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column] + 1
      );
    }
  }

  return matrix[right.length][left.length];
}

interface RateLimitConfig {
  table: string;
  sessionColumn: string;
  windowMs: number;
  max: number;
  messageKey: string;
}

const RATE_LIMITS = {
  submission: { table: 'equivalents', sessionColumn: 'created_by_session', windowMs: 86400000, max: 10, messageKey: 'rate.submission' },
  vote: { table: 'feedback_votes', sessionColumn: 'session_id', windowMs: 3600000, max: 50, messageKey: 'rate.vote' },
  flag: { table: 'equivalent_flags', sessionColumn: 'session_id', windowMs: 3600000, max: 5, messageKey: 'rate.flag' },
} as const satisfies Record<string, RateLimitConfig>;

async function enforceRateLimit(sessionId: string, config: RateLimitConfig, lang: ServerLang): Promise<void> {
  const windowStart = new Date(Date.now() - config.windowMs);
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM ${config.table} WHERE ${config.sessionColumn} = $1 AND created_at > $2`,
    [sessionId, windowStart]
  );
  const count = parseInt(result.rows[0].count, 10);
  if (count >= config.max) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: serverT(lang, config.messageKey) });
  }
}

export async function checkSubmissionRateLimit(sessionId: string, lang: ServerLang = 'es'): Promise<void> {
  await enforceRateLimit(sessionId, RATE_LIMITS.submission, lang);
}

export async function checkVoteRateLimit(sessionId: string, lang: ServerLang = 'es'): Promise<void> {
  await enforceRateLimit(sessionId, RATE_LIMITS.vote, lang);
}

export async function checkFlagRateLimit(sessionId: string, lang: ServerLang = 'es'): Promise<void> {
  await enforceRateLimit(sessionId, RATE_LIMITS.flag, lang);
}

export async function ensureSession(sessionId?: string): Promise<SessionInfo> {
  const resolvedSessionId = sessionId ?? randomUUID();

  if (sessionId) {
    const existing = await pool.query<SessionRow>(
      `SELECT id, reputation FROM app_sessions WHERE id = $1`,
      [resolvedSessionId]
    );
    if (existing.rows.length) {
      return { sessionId: existing.rows[0].id, reputation: existing.rows[0].reputation };
    }
  }

  const result = await pool.query<SessionRow>(
    `INSERT INTO app_sessions (id) VALUES ($1)
     ON CONFLICT (id) DO NOTHING
     RETURNING id, reputation`,
    [resolvedSessionId]
  );

  if (result.rows.length) {
    return { sessionId: result.rows[0].id, reputation: result.rows[0].reputation };
  }

  const fallback = await pool.query<SessionRow>(
    `SELECT id, reputation FROM app_sessions WHERE id = $1`,
    [resolvedSessionId]
  );
  return { sessionId: fallback.rows[0].id, reputation: fallback.rows[0].reputation };
}

const EQUIVALENT_COLS = `id, skill_name_en, skill_name_es, item_name_en, item_name_es,
  ratio, offer_unit, receive_unit, description_en, description_es, status,
  helpful_votes, not_helpful_votes, confidence_score, created_at`;

const EQUIVALENT_COLS_FULL = `${EQUIVALENT_COLS}, flagged_count, rejection_reason, banana_value, source_type, source_attribution`;

function isComplexQuery(query: string): boolean {
  const wordCount = query.split(/\s+/).length;
  return wordCount >= 6;
}

export async function searchEquivalents(
  query: string,
  lang: ServerLang = 'es',
  page = 1,
  pageSize = 10
): Promise<SearchEquivalentsResponse> {
  const empty = { items: [], total: 0, page, pageSize, totalPages: 0 };

  if (!query) {
    return { ...empty, message: serverT(lang, 'search.empty') };
  }

  if (isComplexQuery(query)) {
    return { ...empty, isComplexQuery: true, message: serverT(lang, 'search.complexQuery') };
  }

  const skillCol = lang === 'es' ? 'skill_name_es' : 'skill_name_en';
  const itemCol = lang === 'es' ? 'item_name_es' : 'item_name_en';
  const maxResults = 50;
  const offset = (page - 1) * pageSize;

  const likePattern = `%${query}%`;
  const ilikeCond = `
    status = 'approved'
    AND (
      skill_name_en ILIKE $1 OR skill_name_es ILIKE $1
      OR item_name_en ILIKE $1 OR item_name_es ILIKE $1
    )
  `;

  const [countResult, result] = await Promise.all([
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM equivalents WHERE ${ilikeCond}`,
      [likePattern]
    ),
    pool.query<EquivalentRow>(
      `
        SELECT ${EQUIVALENT_COLS}, banana_value, source_type, source_attribution
        FROM equivalents
        WHERE ${ilikeCond}
        ORDER BY
          GREATEST(similarity(${skillCol}, $2), similarity(skill_name_en, $2), similarity(skill_name_es, $2))
          + GREATEST(similarity(${itemCol}, $2), similarity(item_name_en, $2), similarity(item_name_es, $2)) DESC,
          confidence_score DESC,
          created_at DESC
        LIMIT $3 OFFSET $4
      `,
      [likePattern, query, pageSize, offset]
    ),
  ]);

  const total = Math.min(parseInt(countResult.rows[0].count, 10), maxResults);
  const totalPages = Math.ceil(total / pageSize);

  if (!result.rows.length) {
    return { ...empty, message: serverT(lang, 'search.noResults') };
  }

  return {
    items: result.rows.map((row) => toEquivalentSummary(row, lang)),
    total,
    page,
    pageSize,
    totalPages,
    message: null,
  };
}

export async function saveAiSuggestion(
  input: {
    skillNameEn: string; skillNameEs: string;
    itemNameEn: string; itemNameEs: string;
    ratio: number; bananaValue: number | null;
    descriptionEn: string; descriptionEs: string;
    offerUnit?: string; receiveUnit?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const duplicate = await pool.query<{ id: string }>(
    `SELECT id FROM equivalents
     WHERE (similarity(skill_name_en, $1) > 0.4 AND similarity(item_name_en, $2) > 0.4)
        OR (similarity(skill_name_es, $3) > 0.4 AND similarity(item_name_es, $4) > 0.4)
     LIMIT 1`,
    [input.skillNameEn, input.itemNameEn, input.skillNameEs, input.itemNameEs]
  );

  if (duplicate.rows.length > 0) {
    return { success: false, message: 'A similar equivalent already exists.' };
  }

  await pool.query(
    `INSERT INTO equivalents (
       skill_name_en, skill_name_es, item_name_en, item_name_es,
       ratio, offer_unit, receive_unit, description_en, description_es,
       banana_value, status, source_type, source_attribution
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', 'ai_suggested', 'AI-generated suggestion')`,
    [
      input.skillNameEn, input.skillNameEs,
      input.itemNameEn, input.itemNameEs,
      input.ratio, input.offerUnit ?? 'hour', input.receiveUnit ?? 'hour',
      input.descriptionEn, input.descriptionEs,
      input.bananaValue,
    ]
  );

  return { success: true, message: 'AI suggestion saved for moderator review.' };
}

export async function submitEquivalent(
  sessionId: string,
  input: SubmitEquivalentInput,
  lang: ServerLang = 'es'
): Promise<SubmitEquivalentResponse> {
  await checkSubmissionRateLimit(sessionId, lang);

  const { skillName, itemName, description } = input;

  const searchCol = lang === 'es' ? 'skill_name_es' : 'skill_name_en';
  const itemSearchCol = lang === 'es' ? 'item_name_es' : 'item_name_en';

  const duplicate = await pool.query<{ skill_name_en: string; item_name_en: string; ratio: string }>(
    `
      SELECT skill_name_en, item_name_en, ratio
      FROM equivalents
      WHERE status IN ('approved', 'pending')
        AND similarity(${searchCol}, $1) > 0.4
        AND similarity(${itemSearchCol}, $2) > 0.4
      LIMIT 1
    `,
    [skillName, itemName]
  );

  const duplicateRow = duplicate.rows[0] ?? null;

  const result = await withTransaction(async (client) => {
    const insertResult = await client.query<EquivalentRow>(
      `
        INSERT INTO equivalents (
          skill_name_en, skill_name_es, item_name_en, item_name_es,
          ratio, offer_unit, receive_unit, description_en, description_es,
          status, created_by_session, banana_value, source_type
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10, $11, 'community')
        RETURNING ${EQUIVALENT_COLS}, banana_value, source_type, source_attribution
      `,
      [
        skillName, skillName,
        itemName, itemName,
        input.ratio, input.offerUnit ?? 'hour', input.receiveUnit ?? 'hour',
        description, description,
        sessionId, input.bananaValue ?? null,
      ]
    );

    const sessionResult = await client.query<SessionRow>(
      `
        UPDATE app_sessions
        SET reputation = reputation + 1
        WHERE id = $1
        RETURNING id, reputation
      `,
      [sessionId]
    );

    return { insertResult, sessionResult };
  });

  void translatePendingEntries();

  return {
    success: true,
    status: 'pending',
    message: serverT(lang, 'submit.success'),
    warning: duplicateRow
      ? serverT(lang, 'submit.duplicateWarning', {
          equivalent: formatEquivalentI18n(
            duplicateRow.skill_name_en,
            duplicateRow.item_name_en,
            Number(duplicateRow.ratio),
            lang
          ),
        })
      : null,
    reputation: result.sessionResult.rows[0].reputation,
    contribution: toEquivalentSummary(result.insertResult.rows[0], lang),
  };
}

export async function getContributionHistory(
  sessionId: string,
  lang: ServerLang = 'es'
): Promise<ContributionHistoryResponse> {
  const result = await pool.query<EquivalentRow>(
    `
      SELECT ${EQUIVALENT_COLS_FULL}
      FROM equivalents
      WHERE created_by_session = $1
      ORDER BY created_at DESC
      LIMIT 50
    `,
    [sessionId]
  );

  return {
    contributions: result.rows.map((row) => toEquivalentSummary(row, lang)),
    total: result.rows.length,
  };
}

export async function submitFeedback(
  sessionId: string,
  input: FeedbackVoteInput,
  lang: ServerLang = 'es'
): Promise<FeedbackVoteResponse> {
  await checkVoteRateLimit(sessionId, lang);

  try {
    const row = await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO feedback_votes (equivalent_id, session_id, vote_type, reason) VALUES ($1, $2, $3, $4)`,
        [input.equivalentId, sessionId, input.voteType, input.reason?.trim() || null]
      );

      const updateResult = await client.query<{
        helpful_votes: number;
        not_helpful_votes: number;
        confidence_score: number;
      }>(
        `UPDATE equivalents
         SET helpful_votes = helpful_votes + CASE WHEN $2 = 'helpful' THEN 1 ELSE 0 END,
             not_helpful_votes = not_helpful_votes + CASE WHEN $2 = 'not_helpful' THEN 1 ELSE 0 END
         WHERE id = $1
         RETURNING helpful_votes, not_helpful_votes, confidence_score`,
        [input.equivalentId, input.voteType]
      );

      return updateResult.rows[0];
    });

    return {
      success: true,
      message: null,
      newScore: row.confidence_score,
      helpfulVotes: row.helpful_votes,
      notHelpfulVotes: row.not_helpful_votes,
      promptContext:
        input.voteType === 'not_helpful' && !input.reason?.trim()
          ? serverT(lang, 'vote.promptContext')
          : null,
    };
  } catch (error) {
    if (isPostgresError(error) && error.code === PG_UNIQUE_VIOLATION) {
      return {
        success: false,
        message: serverT(lang, 'vote.duplicate'),
        newScore: null,
        helpfulVotes: null,
        notHelpfulVotes: null,
        promptContext: null,
      };
    }
    throw error;
  }
}
