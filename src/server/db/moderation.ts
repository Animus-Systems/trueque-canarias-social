import { TRPCError } from '@trpc/server';
import type {
  FlagEquivalentInput,
  FlagEquivalentResponse,
  ModerationActionInput,
  ModerationActionResponse,
  ModerationLogEntry,
  ModerationLogInput,
  ModerationLogResponse,
  ModerationQueueInput,
  ModerationQueueResponse,
} from '../contracts.js';
import { serverT, type ServerLang } from '../i18n.js';
import pool, { isPostgresError, PG_UNIQUE_VIOLATION, withTransaction } from './pool.js';
import { checkFlagRateLimit, type EquivalentRow, toEquivalentSummary } from './repository.js';

const AUTO_REJECT_THRESHOLD = 3;

export async function flagEquivalent(
  sessionId: string,
  input: FlagEquivalentInput,
  lang: ServerLang = 'es'
): Promise<FlagEquivalentResponse> {
  await checkFlagRateLimit(sessionId, lang);

  try {
    const autoRejected = await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO equivalent_flags (equivalent_id, session_id, reason) VALUES ($1, $2, $3)`,
        [input.equivalentId, sessionId, input.reason]
      );

      const updateResult = await client.query<{ flagged_count: number; status: 'pending' | 'approved' | 'rejected' }>(
        `UPDATE equivalents SET flagged_count = flagged_count + 1 WHERE id = $1 RETURNING flagged_count, status`,
        [input.equivalentId]
      );

      if (!updateResult.rows.length) {
        return null;
      }

      const { flagged_count, status } = updateResult.rows[0];

      if (flagged_count >= AUTO_REJECT_THRESHOLD && status !== 'rejected') {
        await client.query(
          `UPDATE equivalents SET status = 'rejected', rejection_reason = 'Auto-rejected: flagged by multiple users' WHERE id = $1`,
          [input.equivalentId]
        );
        await client.query(
          `INSERT INTO moderation_log (equivalent_id, performed_by, action, previous_status, new_status, reason)
           VALUES ($1, NULL, 'auto_rejected', $2, 'rejected', 'Flagged by ' || $3 || ' users')`,
          [input.equivalentId, status, flagged_count]
        );
        return true;
      }

      return false;
    });

    if (autoRejected === null) {
      return { success: false, message: serverT(lang, 'flag.notFound'), autoRejected: false };
    }

    return {
      success: true,
      message: autoRejected ? serverT(lang, 'flag.autoRejected') : serverT(lang, 'flag.success'),
      autoRejected,
    };
  } catch (error) {
    if (isPostgresError(error) && error.code === PG_UNIQUE_VIOLATION) {
      return { success: false, message: serverT(lang, 'flag.duplicate'), autoRejected: false };
    }
    throw error;
  }
}

export async function getModerationQueue(
  input: ModerationQueueInput,
  lang: ServerLang = 'es'
): Promise<ModerationQueueResponse> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (input.status) {
    conditions.push(`status = $${paramIndex}`);
    params.push(input.status);
    paramIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataParams = [...params, input.limit, input.offset];
  const [countResult, dataResult] = await Promise.all([
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM equivalents ${whereClause}`,
      params
    ),
    pool.query<EquivalentRow>(
      `SELECT
         id, skill_name_en, skill_name_es, item_name_en, item_name_es,
         ratio, description_en, description_es, status,
         helpful_votes, not_helpful_votes, confidence_score,
         created_at, offer_unit, receive_unit,
         flagged_count, rejection_reason, banana_value,
         source_type, source_attribution
       FROM equivalents
       ${whereClause}
       ORDER BY
         CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
         flagged_count DESC,
         created_at ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataParams
    ),
  ]);

  return {
    items: dataResult.rows.map((row) => toEquivalentSummary(row, lang)),
    total: parseInt(countResult.rows[0].count, 10),
  };
}

export async function moderateEquivalent(
  moderatorSessionId: string,
  input: ModerationActionInput,
  lang: ServerLang = 'es'
): Promise<ModerationActionResponse> {
  return withTransaction(async (client) => {
    const current = await client.query<{ status: 'pending' | 'approved' | 'rejected'; created_by_session: string | null }>(
      `SELECT status, created_by_session FROM equivalents WHERE id = $1 FOR UPDATE`,
      [input.equivalentId]
    );

    if (!current.rows.length) {
      throw new TRPCError({ code: 'NOT_FOUND', message: serverT(lang, 'mod.notFound') });
    }

    const { status: previousStatus, created_by_session } = current.rows[0];
    const newStatus = input.action === 'approve' ? 'approved' : 'rejected';

    if (previousStatus === newStatus) {
      return { success: false, message: serverT(lang, 'mod.alreadyStatus', { status: newStatus }) };
    }

    const rejectionReason = input.action === 'reject' ? (input.reason ?? input.notes ?? null) : null;

    await client.query(
      `UPDATE equivalents SET status = $1, moderated_by = $2, moderated_at = NOW(), rejection_reason = $3 WHERE id = $4`,
      [newStatus, moderatorSessionId, rejectionReason, input.equivalentId]
    );

    await client.query(
      `INSERT INTO moderation_log (equivalent_id, performed_by, action, previous_status, new_status, reason) VALUES ($1, $2, $3, $4, $5, $6)`,
      [input.equivalentId, moderatorSessionId, newStatus, previousStatus, newStatus, input.notes ?? rejectionReason]
    );

    if (input.action === 'approve' && created_by_session) {
      await client.query(`UPDATE app_sessions SET reputation = reputation + 1 WHERE id = $1`, [created_by_session]);
    }

    return { success: true, message: serverT(lang, 'mod.success', { status: newStatus }) };
  });
}

interface ModerationLogRow {
  id: string;
  equivalent_id: string;
  action: 'approved' | 'rejected' | 'auto_rejected';
  performed_by: string | null;
  reason: string | null;
  previous_status: 'pending' | 'approved' | 'rejected';
  new_status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}

function toLogEntry(row: ModerationLogRow): ModerationLogEntry {
  return {
    id: row.id,
    equivalentId: row.equivalent_id,
    action: row.action,
    performedBy: row.performed_by,
    reason: row.reason,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getModerationLog(
  input: ModerationLogInput
): Promise<ModerationLogResponse> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (input.equivalentId) {
    conditions.push(`equivalent_id = $${paramIndex}`);
    params.push(input.equivalentId);
    paramIndex += 1;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const dataParams = [...params, input.limit, input.offset];
  const [countResult, dataResult] = await Promise.all([
    pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM moderation_log ${whereClause}`,
      params
    ),
    pool.query<ModerationLogRow>(
      `SELECT id, equivalent_id, action, performed_by, reason, previous_status, new_status, created_at
       FROM moderation_log
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      dataParams
    ),
  ]);

  return {
    entries: dataResult.rows.map(toLogEntry),
    total: parseInt(countResult.rows[0].count, 10),
  };
}
