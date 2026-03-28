import { appConfig } from './config.js';
import type { ServerLang } from './i18n.js';
import { callOpenRouter, parseJsonResponse } from './openrouter.js';
import pool from './db/pool.js';

const LANG_NAMES: Record<ServerLang, string> = {
  en: 'English',
  es: 'Spanish',
};

interface TranslationResult {
  skillName: string;
  itemName: string;
  description: string;
}

export async function translateFields(
  fields: { skillName: string; itemName: string; description: string },
  from: ServerLang,
  to: ServerLang
): Promise<TranslationResult> {
  if (from === to) return fields;
  if (!appConfig.openRouterApiKey) return fields;

  const content = await callOpenRouter({
    systemPrompt: `You are a translator. Translate the following JSON fields from ${LANG_NAMES[from]} to ${LANG_NAMES[to]}. Return ONLY valid JSON with the same keys. Keep proper nouns and technical terms recognizable. Be concise and natural.`,
    userMessage: JSON.stringify({
      skillName: fields.skillName,
      itemName: fields.itemName,
      description: fields.description,
    }),
  });

  const parsed = parseJsonResponse<Record<string, unknown>>(content);
  if (!parsed) return fields;

  return {
    skillName: typeof parsed.skillName === 'string' ? parsed.skillName : fields.skillName,
    itemName: typeof parsed.itemName === 'string' ? parsed.itemName : fields.itemName,
    description: typeof parsed.description === 'string' ? parsed.description : fields.description,
  };
}

export async function translatePendingEntries(): Promise<{ translated: number; remaining: number }> {
  if (!appConfig.openRouterApiKey) return { translated: 0, remaining: 0 };

  try {
    const missing = await pool.query<{
      id: string;
      skill_name_en: string;
      skill_name_es: string;
      item_name_en: string;
      item_name_es: string;
      description_en: string;
      description_es: string;
    }>(
      `SELECT id, skill_name_en, skill_name_es, item_name_en, item_name_es, description_en, description_es
       FROM equivalents
       WHERE skill_name_en = skill_name_es
       LIMIT 5`
    );

    for (const row of missing.rows) {
      const toEs = await translateFields(
        { skillName: row.skill_name_en, itemName: row.item_name_en, description: row.description_en },
        'en',
        'es'
      );
      await pool.query(
        `UPDATE equivalents SET skill_name_es = $2, item_name_es = $3, description_es = $4 WHERE id = $1`,
        [row.id, toEs.skillName, toEs.itemName, toEs.description]
      );

      console.log(`Translated entry ${row.id} (${row.skill_name_en})`);
    }

    const remainingResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM equivalents WHERE skill_name_en = skill_name_es`
    );
    const remaining = parseInt(remainingResult.rows[0].count, 10);

    return { translated: missing.rows.length, remaining };
  } catch (error) {
    console.error('Background translation pass failed:', error instanceof Error ? error.message : error);
    return { translated: 0, remaining: -1 };
  }
}
