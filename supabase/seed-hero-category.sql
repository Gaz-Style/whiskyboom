-- ============================================================
-- INSERTAR REGISTRO PARA EL BANNER PRINCIPAL (HERO)
-- ============================================================

INSERT INTO banners (id, title, subtitle, cta_text, href, image_url, dark, is_active, sort_order)
VALUES (
  'hero-banner',
  'Los Mejores Whiskies del Mundo',
  'Más de 200 referencias premium. Single malts escoceses, bourbons americanos, japoneses y ediciones limitadas.',
  'Explorar Whiskies',
  '/productos',
  '/hero.jpg',
  true,
  true,
  0
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ACTUALIZAR IMÁGENES POR DEFECTO PARA CATEGORÍAS PREEXISTENTES
-- ============================================================

UPDATE categories SET image_url = '/cat-single-malt.jpg' WHERE name = 'Single Malt Escocés' AND image_url IS NULL;
UPDATE categories SET image_url = '/cat-bourbon.jpg' WHERE name = 'Bourbon & Tennessee' AND image_url IS NULL;
UPDATE categories SET image_url = '/cat-blended.jpg' WHERE name = 'Blended Escocés' AND image_url IS NULL;
UPDATE categories SET image_url = '/cat-japones.jpg' WHERE name = 'Whisky Japonés' AND image_url IS NULL;
