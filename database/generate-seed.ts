import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

interface Item {
  en: string;
  es: string;
  unit: 'hour' | 'kg' | 'unit' | 'dozen' | 'liter';
  priceEur: number;
  category: string;
  descEn: string;
  descEs: string;
}

const BANANA_PRICE = 1.5;

const items: Item[] = [
  // --- Services (per hour) ---
  { en: 'guitar lessons', es: 'clases de guitarra', unit: 'hour', priceEur: 20, category: 'music', descEn: 'Private guitar instruction', descEs: 'Clases particulares de guitarra' },
  { en: 'piano lessons', es: 'clases de piano', unit: 'hour', priceEur: 25, category: 'music', descEn: 'Private piano instruction', descEs: 'Clases particulares de piano' },
  { en: 'singing lessons', es: 'clases de canto', unit: 'hour', priceEur: 22, category: 'music', descEn: 'Vocal coaching', descEs: 'Clases de voz' },
  { en: 'drum lessons', es: 'clases de batería', unit: 'hour', priceEur: 20, category: 'music', descEn: 'Drum and percussion instruction', descEs: 'Clases de batería y percusión' },
  { en: 'surf lessons', es: 'clases de surf', unit: 'hour', priceEur: 30, category: 'sports', descEn: 'Surf instruction including board. Popular in Fuerteventura.', descEs: 'Clases de surf con tabla incluida. Popular en Fuerteventura.' },
  { en: 'diving instruction', es: 'clases de buceo', unit: 'hour', priceEur: 35, category: 'sports', descEn: 'Scuba diving lessons. Common across all islands.', descEs: 'Clases de buceo. Común en todas las islas.' },
  { en: 'yoga instruction', es: 'clases de yoga', unit: 'hour', priceEur: 18, category: 'wellness', descEn: 'Group or private yoga sessions', descEs: 'Sesiones de yoga grupales o privadas' },
  { en: 'personal training', es: 'entrenamiento personal', unit: 'hour', priceEur: 30, category: 'wellness', descEn: 'Fitness coaching and workout planning', descEs: 'Coaching fitness y planificación de entrenamientos' },
  { en: 'massage therapy', es: 'masaje terapéutico', unit: 'hour', priceEur: 35, category: 'wellness', descEn: 'Professional therapeutic massage', descEs: 'Masaje terapéutico profesional' },
  { en: 'pilates instruction', es: 'clases de pilates', unit: 'hour', priceEur: 20, category: 'wellness', descEn: 'Pilates mat or reformer sessions', descEs: 'Sesiones de pilates suelo o máquina' },
  { en: 'Spanish tutoring', es: 'clases de español', unit: 'hour', priceEur: 20, category: 'education', descEn: 'Spanish language lessons for foreigners', descEs: 'Clases de español para extranjeros' },
  { en: 'English tutoring', es: 'clases de inglés', unit: 'hour', priceEur: 20, category: 'education', descEn: 'English language lessons', descEs: 'Clases de inglés' },
  { en: 'German tutoring', es: 'clases de alemán', unit: 'hour', priceEur: 22, category: 'education', descEn: 'German language lessons. High demand in tourist areas.', descEs: 'Clases de alemán. Alta demanda en zonas turísticas.' },
  { en: 'math tutoring', es: 'clases de matemáticas', unit: 'hour', priceEur: 18, category: 'education', descEn: 'Math help for students', descEs: 'Ayuda con matemáticas para estudiantes' },
  { en: 'science tutoring', es: 'clases de ciencias', unit: 'hour', priceEur: 18, category: 'education', descEn: 'Physics, chemistry, biology tutoring', descEs: 'Clases de física, química, biología' },
  { en: 'cooking lessons', es: 'clases de cocina', unit: 'hour', priceEur: 15, category: 'culinary', descEn: 'Home cooking instruction', descEs: 'Clases de cocina casera' },
  { en: 'baking lessons', es: 'clases de repostería', unit: 'hour', priceEur: 15, category: 'culinary', descEn: 'Bread and pastry making', descEs: 'Elaboración de pan y repostería' },
  { en: 'web design', es: 'diseño web', unit: 'hour', priceEur: 30, category: 'tech', descEn: 'Website design and development', descEs: 'Diseño y desarrollo de sitios web' },
  { en: 'graphic design', es: 'diseño gráfico', unit: 'hour', priceEur: 25, category: 'tech', descEn: 'Logo, branding, and visual design', descEs: 'Diseño de logos, branding y diseño visual' },
  { en: 'IT support', es: 'soporte informático', unit: 'hour', priceEur: 25, category: 'tech', descEn: 'Computer troubleshooting and setup', descEs: 'Resolución de problemas informáticos y configuración' },
  { en: 'social media management', es: 'gestión de redes sociales', unit: 'hour', priceEur: 20, category: 'tech', descEn: 'Content creation and posting', descEs: 'Creación y publicación de contenido' },
  { en: 'video editing', es: 'edición de vídeo', unit: 'hour', priceEur: 25, category: 'tech', descEn: 'Video production and editing', descEs: 'Producción y edición de vídeo' },
  { en: 'photography', es: 'fotografía', unit: 'hour', priceEur: 25, category: 'creative', descEn: 'Event or portrait photography', descEs: 'Fotografía de eventos o retratos' },
  { en: 'painting (art)', es: 'pintura artística', unit: 'hour', priceEur: 15, category: 'creative', descEn: 'Art lessons or commissioned paintings', descEs: 'Clases de arte o pinturas por encargo' },
  { en: 'pottery', es: 'cerámica', unit: 'hour', priceEur: 18, category: 'creative', descEn: 'Ceramic and pottery workshops', descEs: 'Talleres de cerámica' },
  { en: 'sewing and alterations', es: 'costura y arreglos', unit: 'hour', priceEur: 12, category: 'crafts', descEn: 'Clothing repairs and custom sewing', descEs: 'Arreglos de ropa y costura a medida' },
  { en: 'knitting', es: 'punto y ganchillo', unit: 'hour', priceEur: 10, category: 'crafts', descEn: 'Hand-knitting and crochet work', descEs: 'Trabajo de punto y ganchillo a mano' },
  { en: 'plumbing', es: 'fontanería', unit: 'hour', priceEur: 30, category: 'trades', descEn: 'Pipe and fixture repair', descEs: 'Reparación de tuberías y accesorios' },
  { en: 'electrical work', es: 'trabajo eléctrico', unit: 'hour', priceEur: 28, category: 'trades', descEn: 'Wiring, outlets, and electrical repair', descEs: 'Cableado, enchufes y reparaciones eléctricas' },
  { en: 'carpentry', es: 'carpintería', unit: 'hour', priceEur: 25, category: 'trades', descEn: 'Wood furniture and repair', descEs: 'Muebles de madera y reparaciones' },
  { en: 'wall painting', es: 'pintura de paredes', unit: 'hour', priceEur: 15, category: 'trades', descEn: 'Interior and exterior painting', descEs: 'Pintura interior y exterior' },
  { en: 'tiling', es: 'alicatado', unit: 'hour', priceEur: 22, category: 'trades', descEn: 'Tile installation for bathrooms and kitchens', descEs: 'Instalación de azulejos para baños y cocinas' },
  { en: 'gardening', es: 'jardinería', unit: 'hour', priceEur: 12, category: 'home', descEn: 'Garden maintenance and planting', descEs: 'Mantenimiento de jardín y plantación' },
  { en: 'house cleaning', es: 'limpieza del hogar', unit: 'hour', priceEur: 12, category: 'home', descEn: 'General home cleaning', descEs: 'Limpieza general del hogar' },
  { en: 'ironing', es: 'planchado', unit: 'hour', priceEur: 10, category: 'home', descEn: 'Clothes ironing service', descEs: 'Servicio de planchado de ropa' },
  { en: 'dog walking', es: 'paseo de perros', unit: 'hour', priceEur: 10, category: 'pets', descEn: 'Dog walking and exercise', descEs: 'Paseo y ejercicio de perros' },
  { en: 'pet sitting', es: 'cuidado de mascotas', unit: 'hour', priceEur: 10, category: 'pets', descEn: 'In-home pet care', descEs: 'Cuidado de mascotas a domicilio' },
  { en: 'dog grooming', es: 'peluquería canina', unit: 'hour', priceEur: 18, category: 'pets', descEn: 'Professional dog bathing and grooming', descEs: 'Baño y peluquería profesional para perros' },
  { en: 'babysitting', es: 'cuidado de niños', unit: 'hour', priceEur: 12, category: 'childcare', descEn: 'Child supervision at home', descEs: 'Cuidado de niños a domicilio' },
  { en: 'homework help', es: 'ayuda con deberes', unit: 'hour', priceEur: 15, category: 'childcare', descEn: 'After-school homework assistance', descEs: 'Ayuda con los deberes después del colegio' },
  { en: 'bicycle repair', es: 'reparación de bicicletas', unit: 'hour', priceEur: 18, category: 'repair', descEn: 'Bike maintenance and repair', descEs: 'Mantenimiento y reparación de bicicletas' },
  { en: 'car washing', es: 'lavado de coches', unit: 'hour', priceEur: 12, category: 'automotive', descEn: 'Hand car wash and interior cleaning', descEs: 'Lavado a mano y limpieza interior del coche' },
  { en: 'accounting help', es: 'ayuda contable', unit: 'hour', priceEur: 30, category: 'professional', descEn: 'Bookkeeping and tax preparation', descEs: 'Contabilidad y preparación de impuestos' },
  { en: 'legal advice', es: 'asesoría legal', unit: 'hour', priceEur: 40, category: 'professional', descEn: 'Basic legal consultation', descEs: 'Consulta legal básica' },
  { en: 'translation services', es: 'servicios de traducción', unit: 'hour', priceEur: 25, category: 'professional', descEn: 'Document translation EN/ES', descEs: 'Traducción de documentos EN/ES' },

  // --- Goods (per unit) ---
  { en: 'Canarian bananas', es: 'plátanos canarios', unit: 'kg', priceEur: 1.5, category: 'fruit', descEn: 'Locally grown plátano canario', descEs: 'Plátano canario de cultivo local' },
  { en: 'potatoes (papas)', es: 'papas', unit: 'kg', priceEur: 1.2, category: 'vegetables', descEn: 'Local Canarian potatoes', descEs: 'Papas canarias locales' },
  { en: 'tomatoes', es: 'tomates', unit: 'kg', priceEur: 2, category: 'vegetables', descEn: 'Vine-ripened local tomatoes', descEs: 'Tomates locales madurados en rama' },
  { en: 'onions', es: 'cebollas', unit: 'kg', priceEur: 1, category: 'vegetables', descEn: 'Local onions', descEs: 'Cebollas locales' },
  { en: 'avocados', es: 'aguacates', unit: 'kg', priceEur: 4, category: 'fruit', descEn: 'Canarian-grown avocados', descEs: 'Aguacates cultivados en Canarias' },
  { en: 'mangoes', es: 'mangos', unit: 'kg', priceEur: 5, category: 'fruit', descEn: 'Tropical mangoes from the islands', descEs: 'Mangos tropicales de las islas' },
  { en: 'oranges', es: 'naranjas', unit: 'kg', priceEur: 1.5, category: 'fruit', descEn: 'Fresh local oranges', descEs: 'Naranjas frescas locales' },
  { en: 'lemons', es: 'limones', unit: 'kg', priceEur: 2, category: 'fruit', descEn: 'Local lemons', descEs: 'Limones locales' },
  { en: 'papayas', es: 'papayas', unit: 'kg', priceEur: 3.5, category: 'fruit', descEn: 'Tropical papayas grown in Tenerife', descEs: 'Papayas tropicales cultivadas en Tenerife' },
  { en: 'eggs (free-range)', es: 'huevos camperos', unit: 'dozen', priceEur: 3.75, category: 'dairy', descEn: 'Free-range eggs from local farms', descEs: 'Huevos camperos de granjas locales' },
  { en: 'goat cheese', es: 'queso de cabra', unit: 'kg', priceEur: 12, category: 'dairy', descEn: 'Artisan Canarian goat cheese (majorero style)', descEs: 'Queso de cabra canario artesanal (estilo majorero)' },
  { en: 'fresh cheese (queso fresco)', es: 'queso fresco', unit: 'kg', priceEur: 6, category: 'dairy', descEn: 'Soft fresh cheese', descEs: 'Queso fresco blando' },
  { en: 'goat milk', es: 'leche de cabra', unit: 'liter', priceEur: 2, category: 'dairy', descEn: 'Fresh goat milk from local herds', descEs: 'Leche fresca de cabra de rebaños locales' },
  { en: 'honey (local)', es: 'miel local', unit: 'kg', priceEur: 12, category: 'specialty', descEn: 'Canarian wildflower honey', descEs: 'Miel de flores silvestres canaria' },
  { en: 'olive oil', es: 'aceite de oliva', unit: 'liter', priceEur: 6, category: 'pantry', descEn: 'Quality olive oil', descEs: 'Aceite de oliva de calidad' },
  { en: 'gofio', es: 'gofio', unit: 'kg', priceEur: 3, category: 'canarian', descEn: 'Toasted grain flour, Canarian staple', descEs: 'Harina de grano tostado, básico canario' },
  { en: 'mojo sauce', es: 'mojo', unit: 'liter', priceEur: 5, category: 'canarian', descEn: 'Homemade mojo rojo or verde', descEs: 'Mojo rojo o verde casero' },
  { en: 'aloe vera gel', es: 'gel de aloe vera', unit: 'liter', priceEur: 10, category: 'canarian', descEn: 'Pure aloe vera gel from Canarian plants', descEs: 'Gel puro de aloe vera de plantas canarias' },
  { en: 'fresh fish', es: 'pescado fresco', unit: 'kg', priceEur: 8, category: 'seafood', descEn: 'Locally caught fish (vieja, sama, cherne)', descEs: 'Pescado de pesca local (vieja, sama, cherne)' },
  { en: 'fresh shrimp', es: 'gambas frescas', unit: 'kg', priceEur: 14, category: 'seafood', descEn: 'Fresh local shrimp', descEs: 'Gambas frescas locales' },
  { en: 'bread (artisan)', es: 'pan artesanal', unit: 'kg', priceEur: 4, category: 'bakery', descEn: 'Fresh-baked artisan bread', descEs: 'Pan artesanal recién horneado' },
  { en: 'wine (local)', es: 'vino local', unit: 'liter', priceEur: 6, category: 'drinks', descEn: 'Canarian wine from local bodegas', descEs: 'Vino canario de bodegas locales' },
  { en: 'craft beer', es: 'cerveza artesanal', unit: 'liter', priceEur: 5, category: 'drinks', descEn: 'Local craft beer', descEs: 'Cerveza artesanal local' },
  { en: 'coffee beans', es: 'café en grano', unit: 'kg', priceEur: 15, category: 'drinks', descEn: 'Agaete coffee from Gran Canaria', descEs: 'Café de Agaete de Gran Canaria' },
];

interface SeedEntry {
  skillNameEn: string;
  skillNameEs: string;
  itemNameEn: string;
  itemNameEs: string;
  ratio: number;
  offerUnit: string;
  receiveUnit: string;
  bananaValue: number | null;
  descriptionEn: string;
  descriptionEs: string;
  sourceAttribution: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function generatePairs(): SeedEntry[] {
  const entries: SeedEntry[] = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      const ratio = round2(a.priceEur / b.priceEur);
      if (ratio < 0.01 || ratio > 9999) continue;

      const bananaValue = round2(a.priceEur / BANANA_PRICE);

      entries.push({
        skillNameEn: a.en,
        skillNameEs: a.es,
        itemNameEn: b.en,
        itemNameEs: b.es,
        ratio,
        offerUnit: a.unit,
        receiveUnit: b.unit,
        bananaValue,
        descriptionEn: `${a.descEn} (~€${a.priceEur}/${a.unit}) ↔ ${b.descEn} (~€${b.priceEur}/${b.unit})`,
        descriptionEs: `${a.descEs} (~${a.priceEur}€/${a.unit}) ↔ ${b.descEs} (~${b.priceEur}€/${b.unit})`,
        sourceAttribution: 'Generated from Canary Islands market data',
      });
    }
  }

  return entries;
}

async function main() {
  const entries = generatePairs();
  const outPath = path.join(currentDir, 'seed-data.json');
  await writeFile(outPath, JSON.stringify(entries, null, 2));
  console.log(`Generated ${entries.length} entries → ${outPath}`);
}

main();
