import type { BulkImportInput, BulkImportResponse } from '../contracts.js';
import pool from './pool.js';

export async function importEquivalents(input: BulkImportInput): Promise<BulkImportResponse> {
  let imported = 0;
  let skipped = 0;

  for (const entry of input.entries) {
    try {
      await pool.query(
        `INSERT INTO equivalents (
           skill_name_en, skill_name_es, item_name_en, item_name_es,
           ratio, offer_unit, receive_unit, description_en, description_es,
           banana_value, status, source_type, source_attribution
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'approved', 'official', $11)`,
        [
          entry.skillNameEn, entry.skillNameEs,
          entry.itemNameEn, entry.itemNameEs,
          entry.ratio, entry.offerUnit ?? 'hour', entry.receiveUnit ?? 'hour',
          entry.descriptionEn, entry.descriptionEs,
          entry.bananaValue ?? null,
          entry.sourceAttribution ?? 'Bulk import',
        ]
      );
      imported += 1;
    } catch (error) {
      console.error(`Import skipped entry "${entry.skillNameEn}":`, error instanceof Error ? error.message : error);
      skipped += 1;
    }
  }

  return {
    imported,
    skipped,
    message: `Imported ${imported} entries. ${skipped > 0 ? `${skipped} skipped due to errors.` : 'No errors.'}`,
  };
}
