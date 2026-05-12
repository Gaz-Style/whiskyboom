-- ============================================================
--  WHISKYBOOM — Schema Shopify-Level (GreenGlass-inspired)
--  Ejecutar en: Supabase → SQL Editor → New Query
--  REQUISITO: schema.sql y schema-admin.sql ya ejecutados
-- ============================================================


-- ============================================================
-- 1. CAMPOS NUEVOS EN PRODUCTS
-- ============================================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity    INT DEFAULT NULL;          -- NULL = sin control de stock
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 5;           -- "Quedan pocos" si qty <= threshold
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_top_seller     BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tasting_notes     TEXT;                      -- Notas de cata (ej: "Vainilla, caramelo, especias")
ALTER TABLE products ADD COLUMN IF NOT EXISTS pairing           TEXT;                      -- Maridaje sugerido
ALTER TABLE products ADD COLUMN IF NOT EXISTS distillery        TEXT;                      -- Nombre de la destilería
ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images    TEXT[] DEFAULT '{}';       -- URLs adicionales de imágenes

-- Vista actualizada de stats de admin (reemplaza la anterior)
CREATE OR REPLACE VIEW admin_product_stats AS
SELECT
  COUNT(*)                                                        AS total_products,
  COUNT(*) FILTER (WHERE in_stock = false)                        AS out_of_stock,
  COUNT(*) FILTER (WHERE badge = 'new')                           AS new_products,
  COUNT(*) FILTER (WHERE badge = 'sale')                          AS on_sale,
  COUNT(*) FILTER (WHERE badge = 'limited')                       AS limited_products,
  COUNT(*) FILTER (WHERE is_featured = true)                      AS featured_products,
  COUNT(*) FILTER (WHERE is_top_seller = true)                    AS top_sellers,
  COUNT(*) FILTER (WHERE stock_quantity IS NOT NULL AND stock_quantity <= low_stock_threshold AND in_stock = true) AS low_stock_count,
  ROUND(AVG(price)::numeric, 0)                                   AS avg_price,
  MIN(price)                                                      AS min_price,
  MAX(price)                                                      AS max_price
FROM products;


-- ============================================================
-- 2. TABLA: PRODUCT_REVIEWS (con foto y moderación)
-- ============================================================
DROP TABLE IF EXISTS reviews CASCADE; -- Reemplazamos la tabla básica anterior

CREATE TABLE IF NOT EXISTS product_reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT,
  rating           INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title            TEXT,
  comment          TEXT,
  photo_url        TEXT,              -- Foto del cliente con el producto
  verified_purchase BOOLEAN DEFAULT false,
  is_approved      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_approved   ON product_reviews(is_approved);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
-- Cualquier visitante puede leer las aprobadas
CREATE POLICY "reviews_public_read"    ON product_reviews FOR SELECT USING (is_approved = true);
-- Cualquiera puede insertar (dejar una reseña)
CREATE POLICY "reviews_public_insert"  ON product_reviews FOR INSERT WITH CHECK (true);
-- Solo admins gestionan (aprobar/rechazar)
CREATE POLICY "reviews_admin_manage"   ON product_reviews FOR ALL USING (auth.role() = 'authenticated');

-- Trigger: recalcular rating del producto cuando se aprueba/borra una reseña
CREATE OR REPLACE FUNCTION recalculate_product_rating_v2()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating  = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true), 0),
    reviews = (SELECT COUNT(*) FROM product_reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id) AND is_approved = true)
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_reviews_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_product_rating_v2();


-- ============================================================
-- 3. TABLA: SHIPPING_ZONES (Calculadora de envíos)
-- ============================================================
CREATE TABLE IF NOT EXISTS shipping_zones (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province                  TEXT NOT NULL,
  city                      TEXT,               -- NULL = aplica a toda la provincia
  cost                      NUMERIC(10,2) NOT NULL DEFAULT 0,
  days_min                  INT NOT NULL DEFAULT 3,
  days_max                  INT NOT NULL DEFAULT 7,
  is_free_above             NUMERIC(12,2) DEFAULT NULL, -- NULL = nunca gratis; valor = monto mínimo para envío gratis
  is_active                 BOOLEAN DEFAULT true,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shipping_zones_province ON shipping_zones(province);

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipping_public_read"  ON shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "shipping_admin_write"  ON shipping_zones FOR ALL USING (auth.role() = 'authenticated');

-- Zonas base de Argentina
INSERT INTO shipping_zones (province, cost, days_min, days_max, is_free_above) VALUES
  ('Buenos Aires (GBA)',       0,     1, 2,  50000),
  ('Buenos Aires (Interior)',  2500,  2, 4,  80000),
  ('CABA',                     0,     1, 2,  50000),
  ('Córdoba',                  3500,  3, 5,  100000),
  ('Santa Fe',                 3500,  3, 5,  100000),
  ('Mendoza',                  4500,  4, 6,  120000),
  ('Tucumán',                  5000,  4, 7,  150000),
  ('Salta',                    5500,  5, 7,  150000),
  ('Neuquén',                  5000,  5, 7,  150000),
  ('Río Negro',                5000,  5, 7,  150000),
  ('Chubut',                   6000,  6, 9,  NULL),
  ('Santa Cruz',               7000,  7, 10, NULL),
  ('Tierra del Fuego',         9500,  8, 12, NULL),
  ('Entre Ríos',               4000,  3, 6,  120000),
  ('Misiones',                 5500,  5, 8,  NULL),
  ('Corrientes',               5000,  4, 7,  NULL),
  ('Chaco',                    5500,  5, 8,  NULL),
  ('Formosa',                  6000,  5, 8,  NULL),
  ('Santiago del Estero',      5000,  5, 8,  NULL),
  ('La Rioja',                 5000,  5, 8,  NULL),
  ('Catamarca',                5500,  5, 8,  NULL),
  ('Jujuy',                    5500,  5, 8,  NULL),
  ('San Juan',                 4500,  4, 7,  NULL),
  ('San Luis',                 4500,  4, 7,  NULL),
  ('La Pampa',                 5000,  5, 8,  NULL)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. TABLA: CART_CROSS_SELLING (Productos sugeridos en el carrito)
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_cross_selling (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       TEXT DEFAULT 'Más vendido',
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cart_cross_selling ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cross_sell_public_read"  ON cart_cross_selling FOR SELECT USING (is_active = true);
CREATE POLICY "cross_sell_admin_write"  ON cart_cross_selling FOR ALL USING (auth.role() = 'authenticated');
