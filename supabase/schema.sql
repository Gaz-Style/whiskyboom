-- ============================================================
--  WHISKYBOOM — Schema de Base de Datos
--  Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsqueda de texto


-- ============================================================
-- 2. ENUM: BADGE DE PRODUCTO
-- ============================================================
CREATE TYPE product_badge AS ENUM ('new', 'sale', 'limited');


-- ============================================================
-- 3. TABLA: CATEGORIES (Categorías)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,          -- "Single Malt Escocés"
  slug       TEXT NOT NULL UNIQUE,          -- "single-malt-escoces"
  emoji      TEXT,                          -- "🏴󠁧󠁢󠁳󠁣󠁴󠁿"
  image_url  TEXT,                          -- URL imagen de categoría
  sort_order INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 4. TABLA: PRODUCTS (Productos)
-- Campos mapeados 1:1 con tu interface Product en products.ts
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug           TEXT NOT NULL UNIQUE,       -- "macallan-12-double-cask"
  name           TEXT NOT NULL,             -- "The Macallan Double Cask 12 Years"
  brand          TEXT NOT NULL,             -- "The Macallan"
  category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  category       TEXT NOT NULL,             -- "Single Malt Escocés" (desnormalizado para rapidez)
  region         TEXT NOT NULL,             -- "Speyside"
  age            INT,                        -- 12 (puede ser NULL)
  abv            NUMERIC(5,2) NOT NULL,     -- 40.00 (% alcohol)
  volume         INT NOT NULL DEFAULT 700,  -- en ml
  price          NUMERIC(12,2) NOT NULL,    -- 89990.00
  original_price NUMERIC(12,2),            -- Precio antes de descuento
  image          TEXT,                      -- "/images/products/macallan-12.jpg"
  badge          product_badge,             -- 'new' | 'sale' | 'limited'
  description    TEXT,
  in_stock       BOOLEAN NOT NULL DEFAULT true,
  rating         NUMERIC(3,2) DEFAULT 0,   -- 4.80
  reviews        INT DEFAULT 0,
  is_featured    BOOLEAN DEFAULT false,     -- Para sección "Destacados"
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda y filtros
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_brand       ON products(brand);
CREATE INDEX idx_products_category    ON products(category);
CREATE INDEX idx_products_badge       ON products(badge);
CREATE INDEX idx_products_in_stock    ON products(in_stock);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_price       ON products(price);
CREATE INDEX idx_products_search      ON products USING gin(to_tsvector('spanish', name || ' ' || brand || ' ' || description));


-- ============================================================
-- 5. TABLA: PRODUCT_IMAGES (Imágenes adicionales por producto)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 6. TABLA: REVIEWS (Reseñas de usuarios)
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name  TEXT NOT NULL,
  rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  verified   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);


-- ============================================================
-- 7. FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 8. FUNCIÓN: Recalcular rating y reviews de un producto
-- ============================================================
CREATE OR REPLACE FUNCTION recalculate_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating  = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    reviews = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_product_rating();


-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Products: lectura pública, escritura solo autenticados
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read"  ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_write"  ON products FOR ALL USING (auth.role() = 'authenticated');

-- Categories: lectura pública
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Reviews: lectura pública, insert para todos
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read"  ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_public_insert" ON reviews FOR INSERT WITH CHECK (true);

-- Product images: lectura pública
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images_public_read" ON product_images FOR SELECT USING (true);


-- ============================================================
-- 10. DATOS INICIALES — CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, emoji, sort_order) VALUES
  ('Single Malt Escocés', 'single-malt-escoces', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 1),
  ('Bourbon & Tennessee',  'bourbon-tennessee',   '🇺🇸', 2),
  ('Blended Escocés',      'blended-escoces',     '🥃', 3),
  ('Whisky Japonés',       'japones',             '🇯🇵', 4),
  ('Blended Malt',         'blended-malt',        '🌾', 5),
  ('Irish Whiskey',        'irish',               '🍀', 6)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 11. DATOS INICIALES — PRODUCTS (los 8 productos mock)
-- ============================================================
INSERT INTO products (slug, name, brand, category, region, age, abv, volume, price, original_price, image, badge, description, in_stock, rating, reviews, is_featured) VALUES
  (
    'macallan-12-double-cask',
    'The Macallan Double Cask 12 Years',
    'The Macallan',
    'Single Malt Escocés',
    'Speyside', 12, 40, 700,
    89990, NULL,
    '/images/products/macallan-12.jpg',
    'new',
    'Madurado en barricas de roble americano y europeo con cera de jerez González Byass.',
    true, 4.8, 124, true
  ),
  (
    'glenfiddich-15',
    'Glenfiddich 15 Year Old Solera',
    'Glenfiddich',
    'Single Malt Escocés',
    'Speyside', 15, 40, 700,
    74990, 89990,
    '/images/products/glenfiddich-15.jpg',
    'sale',
    'Sistema Solera único que combina whiskies de tres tipos de barricas distintas.',
    true, 4.7, 98, true
  ),
  (
    'laphroaig-10',
    'Laphroaig 10 Year Old',
    'Laphroaig',
    'Single Malt Escocés',
    'Islay', 10, 40, 700,
    64990, NULL,
    '/images/products/laphroaig-10.jpg',
    NULL,
    'El sabor más ahumado de Islay. Notas de turba, algas marinas y vainilla.',
    true, 4.9, 210, true
  ),
  (
    'johnnie-walker-blue',
    'Johnnie Walker Blue Label',
    'Johnnie Walker',
    'Blended Escocés',
    'Escocia', NULL, 40, 700,
    229990, NULL,
    '/images/products/jw-blue.jpg',
    'limited',
    'La cúspide del arte de mezcla. Elegancia excepcional en cada sorbo.',
    true, 4.9, 87, true
  ),
  (
    'monkey-shoulder',
    'Monkey Shoulder Blended Malt',
    'Monkey Shoulder',
    'Blended Malt',
    'Speyside', NULL, 40, 700,
    39990, NULL,
    '/images/products/monkey-shoulder.jpg',
    'new',
    'Mezcla suave y cremosa de tres single malts de Speyside. Perfecto para cócteles.',
    true, 4.6, 156, false
  ),
  (
    'jack-daniels-single-barrel',
    'Jack Daniel''s Single Barrel',
    'Jack Daniel''s',
    'Tennessee Whiskey',
    'Tennessee, USA', NULL, 45, 700,
    54990, NULL,
    '/images/products/jd-single.jpg',
    NULL,
    'Seleccionado a mano de barricas individuales en la cima del almacén.',
    true, 4.7, 73, false
  ),
  (
    'highland-park-12',
    'Highland Park 12 Year Old Viking Honour',
    'Highland Park',
    'Single Malt Escocés',
    'Orkney', 12, 40, 700,
    59990, 69990,
    '/images/products/highland-park-12.jpg',
    'sale',
    'El equilibrio perfecto entre ahumado y suavidad. Herencia vikinga de Orkney.',
    true, 4.8, 91, false
  ),
  (
    'glenfarclas-105',
    'Glenfarclas 105 Cask Strength',
    'Glenfarclas',
    'Single Malt Escocés',
    'Speyside', NULL, 60, 700,
    79990, NULL,
    '/images/products/glenfarclas-105.jpg',
    'limited',
    'Potencia de barrica completa. Madurado en jerez Oloroso, rico y complejo.',
    false, 4.9, 44, false
  )
ON CONFLICT (slug) DO NOTHING;
