import type { BarterUnit } from './contracts.js';

export type ServerLang = 'en' | 'es';

const SUPPORTED: ServerLang[] = ['en', 'es'];

const UNIT_LABELS: Record<BarterUnit, Record<ServerLang, { one: string; other: string }>> = {
  hour:  { en: { one: 'hour', other: 'hours' },   es: { one: 'hora', other: 'horas' } },
  kg:    { en: { one: 'kg', other: 'kg' },         es: { one: 'kg', other: 'kg' } },
  unit:  { en: { one: 'unit', other: 'units' },    es: { one: 'unidad', other: 'unidades' } },
  dozen: { en: { one: 'dozen', other: 'dozen' },   es: { one: 'docena', other: 'docenas' } },
  liter: { en: { one: 'liter', other: 'liters' },  es: { one: 'litro', other: 'litros' } },
};

export function formatUnitValue(value: number, unit: BarterUnit, lang: ServerLang): string {
  const labels = UNIT_LABELS[unit][lang];
  const form = value === 1 ? labels.one : labels.other;
  return `${value} ${form}`;
}

export function parseLanguage(acceptLanguage: string | undefined): ServerLang {
  if (!acceptLanguage) return 'es';
  const tag = acceptLanguage.split(',')[0].trim().slice(0, 2).toLowerCase();
  return SUPPORTED.includes(tag as ServerLang) ? (tag as ServerLang) : 'es';
}

const messages = {
  en: {
    'search.empty': 'Please enter a skill or item to search',
    'search.noResults': 'No equivalents found. Be the first to add one!',
    'submit.success': 'Contribution submitted for review.',
    'submit.duplicateWarning': 'Similar equivalent already exists: "{equivalent}"',
    'vote.duplicate': 'You have already voted on this equivalent',
    'vote.promptContext': 'Would you like to explain why?',
    'flag.notFound': 'Equivalent not found',
    'flag.duplicate': 'You have already flagged this equivalent',
    'flag.autoRejected': 'This equivalent has been flagged and automatically removed for review.',
    'flag.success': 'Thank you for your feedback. This equivalent has been flagged for review.',
    'mod.notFound': 'Equivalent not found',
    'mod.alreadyStatus': 'Equivalent is already {status}',
    'mod.success': 'Equivalent {status} successfully.',
    'rate.submission': 'Submission limit reached. You can submit up to 10 equivalents per day.',
    'rate.vote': 'Vote limit reached. You can vote up to 50 times per hour.',
    'rate.flag': 'Flag limit reached. You can flag up to 5 equivalents per hour.',
    'format.hour': '1 hour',
    'format.hours': '{n} hours',
    'format.equivalent': '1 hour {skill} ≈ {ratio} {item}',
    'format.banana': '\u{1F34C} \u2248 {value} kg Canarian bananas',
    'search.aiSuggestions': 'No community data found. Here are AI-generated suggestions:',
    'search.complexQuery': 'Analysing your request with AI...',
  },
  es: {
    'search.empty': 'Introduce una habilidad o art\u00edculo para buscar',
    'search.noResults': 'No se encontraron equivalentes. \u00a1S\u00e9 el primero en a\u00f1adir uno!',
    'submit.success': 'Contribuci\u00f3n enviada para revisi\u00f3n.',
    'submit.duplicateWarning': 'Ya existe un equivalente similar: "{equivalent}"',
    'vote.duplicate': 'Ya has votado en este equivalente',
    'vote.promptContext': '\u00bfTe gustar\u00eda explicar por qu\u00e9?',
    'flag.notFound': 'Equivalente no encontrado',
    'flag.duplicate': 'Ya has reportado este equivalente',
    'flag.autoRejected': 'Este equivalente ha sido reportado y eliminado autom\u00e1ticamente para revisi\u00f3n.',
    'flag.success': 'Gracias por tu comentario. Este equivalente ha sido reportado para revisi\u00f3n.',
    'mod.notFound': 'Equivalente no encontrado',
    'mod.alreadyStatus': 'El equivalente ya est\u00e1 {status}',
    'mod.success': 'Equivalente {status} correctamente.',
    'rate.submission': 'L\u00edmite de env\u00edos alcanzado. Puedes enviar hasta 10 equivalentes por d\u00eda.',
    'rate.vote': 'L\u00edmite de votos alcanzado. Puedes votar hasta 50 veces por hora.',
    'rate.flag': 'L\u00edmite de reportes alcanzado. Puedes reportar hasta 5 equivalentes por hora.',
    'format.hour': '1 hora',
    'format.hours': '{n} horas',
    'format.equivalent': '1 hora {skill} \u2248 {ratio} {item}',
    'format.banana': '\u{1F34C} \u2248 {value} kg pl\u00e1tanos canarios',
    'search.aiSuggestions': 'No se encontraron datos comunitarios. Aqu\u00ed hay sugerencias generadas por IA:',
    'search.complexQuery': 'Analizando tu solicitud con IA...',
  },
} as const;

export function serverT(lang: ServerLang, key: string, params?: Record<string, string | number>): string {
  const dict = messages[lang];
  let value = (dict as Record<string, string>)[key] ?? (messages.en as Record<string, string>)[key] ?? key;
  if (params) {
    for (const [placeholder, replacement] of Object.entries(params)) {
      value = value.replace(`{${placeholder}}`, String(replacement));
    }
  }
  return value;
}

export function formatEquivalentI18n(
  skillName: string,
  itemName: string,
  ratio: number,
  lang: ServerLang,
  offerUnit: BarterUnit = 'hour',
  receiveUnit: BarterUnit = 'hour',
): string {
  const offerPart = formatUnitValue(1, offerUnit, lang);
  const receivePart = formatUnitValue(ratio, receiveUnit, lang);
  return `${offerPart} ${skillName} \u2248 ${receivePart} ${itemName}`;
}

export function formatBananaDisplayI18n(bananaValue: number | null, lang: ServerLang): string | null {
  if (bananaValue === null) return null;
  return serverT(lang, 'format.banana', { value: bananaValue });
}
