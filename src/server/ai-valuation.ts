import { unitSchema, type AiSuggestion, type BarterUnit } from './contracts.js';
import { appConfig } from './config.js';
import { formatBananaDisplayI18n, formatEquivalentI18n, type ServerLang } from './i18n.js';
import { callOpenRouter, parseJsonResponse } from './openrouter.js';

function isValidUnit(value: unknown): value is BarterUnit {
  return typeof value === 'string' && unitSchema.options.includes(value as BarterUnit);
}

function stripLeadingUnit(name: string): string {
  return name.replace(/^\d+(\.\d+)?\s*(hours?|kg|units?|dozens?|liters?|horas?|litros?|unidad(es)?|docenas?)\s+(of\s+|de\s+)?/i, '').trim();
}

interface RawAiSuggestion {
  skillNameEn: string;
  skillNameEs: string;
  itemNameEn: string;
  itemNameEs: string;
  ratio: number;
  offerUnit?: string;
  receiveUnit?: string;
  bananaValue: number | null;
  descriptionEn: string;
  descriptionEs: string;
}

const AI_SYSTEM_PROMPT = `You help people in the Canary Islands figure out fair barter exchange rates.

STEP 1 — ESTIMATE PRICES:
For every item mentioned, first estimate its market price in euros.
Use Canary Islands local prices when possible.

STEP 2 — CALCULATE THE BANANA EQUIVALENT:
1 kg of Canarian bananas = \u20ac1.50.
bananaValue = estimated_price / 1.50
This is the MOST IMPORTANT number. It must be accurate.

STEP 3 — CALCULATE BARTER RATIOS:
ratio = price_of_offered_item / price_of_received_item
This works for ANY combination: services\u2194services, goods\u2194goods, services\u2194goods, cheap\u2194expensive.

Example: GPU worth \u20ac1500, dozen eggs worth \u20ac3.75
\u2192 ratio = 1500/3.75 = 400. So 1 unit GPU \u2248 400 dozen eggs. bananaValue = 1000.

Example: 1 hour guitar lessons worth \u20ac20, 1 kg potatoes worth \u20ac1.50
\u2192 ratio = 20/1.50 \u2248 13.3. So 1 hour guitar lessons \u2248 13.3 kg potatoes. bananaValue \u2248 13.3.

RULES:
- Always show the math: estimate prices first, then divide
- Any barter pair is valid as long as the math is correct
- Suggest 3 diverse trades (mix of services, common goods, and different categories)
- All fields bilingual (English + Spanish)

IMPORTANT: skillNameEn/Es and itemNameEn/Es must contain ONLY the name \u2014 NO quantities, NO units, NO "of". Example: "graphic design" not "1 hour of graphic design", "potatoes" not "1 kg of potatoes".

Return ONLY a valid JSON array with up to 3 suggestions:
{
  "skillNameEn": "what the user offers (English)",
  "skillNameEs": "same in Spanish",
  "itemNameEn": "what they get in return (English)",
  "itemNameEs": "same in Spanish",
  "ratio": number (units of itemName per 1 unit of skillName \u2014 DO THE MATH),
  "offerUnit": "hour" | "kg" | "unit" | "dozen" | "liter",
  "receiveUnit": "hour" | "kg" | "unit" | "dozen" | "liter",
  "bananaValue": number (kg of bananas = price / 1.50 \u2014 DO THE MATH),
  "descriptionEn": "show estimated prices and calculation (under 200 chars)",
  "descriptionEs": "same in Spanish"
}`;

export async function generateAiSuggestions(
  query: string,
  lang: ServerLang
): Promise<AiSuggestion[]> {
  const content = await callOpenRouter({
    model: appConfig.openRouterAiModel,
    systemPrompt: AI_SYSTEM_PROMPT,
    userMessage: `${query}\n\nAnalyse this barter query for the Canary Islands. If it's about services, suggest service-for-service trades. If it's about goods/products, calculate fair exchange quantities based on local market prices.`,
    temperature: 0.4,
    maxTokens: 800,
  });

  const parsed = parseJsonResponse<unknown>(content);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item): item is RawAiSuggestion =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).skillNameEn === 'string' &&
      typeof (item as Record<string, unknown>).itemNameEn === 'string' &&
      typeof (item as Record<string, unknown>).ratio === 'number'
    )
    .slice(0, 3)
    .map((item) => {
      const rawSkillEn = stripLeadingUnit(item.skillNameEn);
      const rawSkillEs = stripLeadingUnit(item.skillNameEs || item.skillNameEn);
      const rawItemEn = stripLeadingUnit(item.itemNameEn);
      const rawItemEs = stripLeadingUnit(item.itemNameEs || item.itemNameEn);
      const skillName = lang === 'es' ? rawSkillEs : rawSkillEn;
      const itemName = lang === 'es' ? rawItemEs : rawItemEn;
      const offerUnit: BarterUnit = isValidUnit(item.offerUnit) ? item.offerUnit : 'hour';
      const receiveUnit: BarterUnit = isValidUnit(item.receiveUnit) ? item.receiveUnit : 'hour';

      return {
        skillNameEn: rawSkillEn,
        skillNameEs: rawSkillEs,
        itemNameEn: rawItemEn,
        itemNameEs: rawItemEs,
        ratio: item.ratio,
        offerUnit,
        receiveUnit,
        bananaValue: typeof item.bananaValue === 'number' ? item.bananaValue : null,
        descriptionEn: item.descriptionEn || '',
        descriptionEs: item.descriptionEs || item.descriptionEn || '',
        displayFormat: formatEquivalentI18n(skillName, itemName, item.ratio, lang, offerUnit, receiveUnit),
        bananaDisplayFormat: formatBananaDisplayI18n(
          typeof item.bananaValue === 'number' ? item.bananaValue : null,
          lang
        ),
      };
    });
}
