-- 0006_seed_spanish.sql
-- Populate Spanish translations for the original seed data.

UPDATE equivalents
SET skill_name_es = 'clases de guitarra',
    item_name_es = 'jardinería',
    description_es = 'Intercambio frecuente en el vecindario donde una clase de música se intercambia por ayuda para mantener un pequeño jardín.'
WHERE skill_name_en = 'guitar lessons' AND item_name_en = 'gardening';

UPDATE equivalents
SET skill_name_es = 'cocina',
    item_name_es = 'limpieza',
    description_es = 'Intercambio equilibrado uno a uno utilizado a menudo para la preparación de comidas y el mantenimiento del hogar en viviendas compartidas.'
WHERE skill_name_en = 'cooking' AND item_name_en = 'cleaning';

UPDATE equivalents
SET skill_name_es = 'clases de español',
    item_name_es = 'clases de inglés',
    description_es = 'Intercambio de idiomas con fuerte consenso comunitario en los grupos de estudio locales.'
WHERE skill_name_en = 'spanish tutoring' AND item_name_en = 'english tutoring';
