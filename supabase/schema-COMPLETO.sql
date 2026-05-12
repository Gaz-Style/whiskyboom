-- ================================================================
--  WHISKYBOOM — SQL MAESTRO COMPLETO v2
--  Copiá y pegá TODO en Supabase → SQL Editor → New Query
-- ================================================================


-- ================================================================
-- PASO 1: EXTENSIONES
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ================================================================
-- PASO 2: TIPOS ENUM (seguros si ya existen)
-- ================================================================
DO $$ BEGIN
  CREATE TYPE product_badge AS ENUM ('new', 'sale', 'limited');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ================================================================
-- PASO 3: FUNCIÓN update_updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ================================================================
-- PASO 4: TABLA CATEGORIES
-- ================================================================
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  emoji      TEXT,
  image_url  TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_public_read" ON categories;
DROP POLICY IF EXISTS "categories_admin_write" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON categories FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO categories (name, slug, emoji, sort_order) VALUES
  ('Single Malt Escocés', 'single-malt-escoces', '🥃', 1),
  ('Bourbon & Tennessee',  'bourbon-tennessee',   '🥃', 2),
  ('Blended Escocés',      'blended-escoces',     '🥃', 3),
  ('Whisky Japonés',       'japones',             '🥃', 4),
  ('Blended Malt',         'blended-malt',        '🌾', 5),
  ('Irish Whiskey',        'irish',               '🍀', 6)
ON CONFLICT (slug) DO NOTHING;


-- ================================================================
-- PASO 5: TABLA PRODUCTS (con todos los campos)
-- ================================================================
CREATE TABLE IF NOT EXISTS products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  brand               TEXT NOT NULL,
  category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
  category            TEXT NOT NULL,
  region              TEXT NOT NULL,
  age                 INT,
  abv                 NUMERIC(5,2) NOT NULL,
  volume              INT NOT NULL DEFAULT 700,
  price               NUMERIC(12,2) NOT NULL,
  original_price      NUMERIC(12,2),
  image               TEXT,
  gallery_images      TEXT[] DEFAULT '{}',
  badge               product_badge,
  description         TEXT,
  tasting_notes       TEXT,
  pairing             TEXT,
  distillery          TEXT,
  in_stock            BOOLEAN NOT NULL DEFAULT true,
  stock_quantity      INT DEFAULT NULL,
  low_stock_threshold INT DEFAULT 5,
  is_top_seller       BOOLEAN DEFAULT false,
  rating              NUMERIC(3,2) DEFAULT 0,
  reviews             INT DEFAULT 0,
  is_featured         BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand       ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_badge       ON products(badge);
CREATE INDEX IF NOT EXISTS idx_products_in_stock    ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price       ON products(price);

DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_public_read" ON products;
DROP POLICY IF EXISTS "products_admin_write" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON products FOR ALL USING (auth.role() = 'authenticated');


-- ================================================================
-- PASO 6: VISTA ADMIN STATS
-- ================================================================
CREATE OR REPLACE VIEW admin_product_stats AS
SELECT
  COUNT(*)                                                              AS total_products,
  COUNT(*) FILTER (WHERE in_stock = false)                              AS out_of_stock,
  COUNT(*) FILTER (WHERE badge = 'new')                                 AS new_products,
  COUNT(*) FILTER (WHERE badge = 'sale')                                AS on_sale,
  COUNT(*) FILTER (WHERE badge = 'limited')                             AS limited_products,
  COUNT(*) FILTER (WHERE is_featured = true)                            AS featured_products,
  COUNT(*) FILTER (WHERE is_top_seller = true)                          AS top_sellers,
  COUNT(*) FILTER (WHERE stock_quantity IS NOT NULL
                   AND stock_quantity <= low_stock_threshold
                   AND in_stock = true)                                 AS low_stock_count,
  ROUND(AVG(price)::numeric, 0)                                         AS avg_price,
  MIN(price)                                                            AS min_price,
  MAX(price)                                                            AS max_price
FROM products;


-- ================================================================
-- PASO 7: TABLA PRODUCT_REVIEWS
-- ================================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name     TEXT NOT NULL,
  customer_email    TEXT,
  rating            INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             TEXT,
  comment           TEXT,
  photo_url         TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  is_approved       BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved   ON product_reviews(is_approved);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_public_read"   ON product_reviews;
DROP POLICY IF EXISTS "reviews_public_insert" ON product_reviews;
DROP POLICY IF EXISTS "reviews_admin_manage"  ON product_reviews;
CREATE POLICY "reviews_public_read"   ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "reviews_public_insert" ON product_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_admin_manage"  ON product_reviews FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION recalculate_product_rating_v2()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating  = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    ), 0),
    reviews = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        AND is_approved = true
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_reviews_rating_trigger ON product_reviews;
CREATE TRIGGER product_reviews_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION recalculate_product_rating_v2();


-- ================================================================
-- PASO 8: TABLA SHIPPING_ZONES
-- ================================================================
CREATE TABLE IF NOT EXISTS shipping_zones (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province      TEXT NOT NULL,
  city          TEXT,
  cost          NUMERIC(10,2) NOT NULL DEFAULT 0,
  days_min      INT NOT NULL DEFAULT 3,
  days_max      INT NOT NULL DEFAULT 7,
  is_free_above NUMERIC(12,2) DEFAULT NULL,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_zones_province ON shipping_zones(province);

ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shipping_public_read" ON shipping_zones;
DROP POLICY IF EXISTS "shipping_admin_write" ON shipping_zones;
CREATE POLICY "shipping_public_read" ON shipping_zones FOR SELECT USING (is_active = true);
CREATE POLICY "shipping_admin_write" ON shipping_zones FOR ALL USING (auth.role() = 'authenticated');

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


-- ================================================================
-- PASO 9: TABLA BANNERS
-- ================================================================
CREATE TABLE IF NOT EXISTS banners (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  subtitle   TEXT,
  cta_text   TEXT DEFAULT 'Ver más',
  href       TEXT NOT NULL DEFAULT '/',
  image_url  TEXT,
  dark       BOOLEAN DEFAULT true,
  is_active  BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS banners_updated_at ON banners;
CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "banners_public_read" ON banners;
DROP POLICY IF EXISTS "banners_admin_write" ON banners;
CREATE POLICY "banners_public_read" ON banners FOR SELECT USING (true);
CREATE POLICY "banners_admin_write" ON banners FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO banners (title, subtitle, cta_text, href, dark, sort_order) VALUES
  ('Grandes Ofertas',     'Hasta 30% OFF en selección especial',   'Ver Ofertas',   '/productos?badge=sale', true,  1),
  ('Nuevas Llegadas',     'Descubrí las últimas incorporaciones',  'Ver Novedades', '/productos?badge=new',  false, 2),
  ('Ediciones Limitadas', 'Botellas únicas para coleccionistas',   'Ver Colección', '/productos',            true,  3)
ON CONFLICT DO NOTHING;


-- ================================================================
-- PASO 10: TABLA SITE_SETTINGS
-- ================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings_public_read" ON site_settings;
DROP POLICY IF EXISTS "settings_admin_write" ON site_settings;
CREATE POLICY "settings_public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO site_settings (key, value, description) VALUES
  ('announcement_text',   '🥃 Envío gratis en compras mayores a $50.000 · Pago en hasta 12 cuotas sin interés', 'Texto del announcement bar'),
  ('announcement_active', 'true',                    'Mostrar/ocultar el announcement bar'),
  ('announcement_color',  '#8B1A1A',                 'Color de fondo del announcement bar'),
  ('instagram_url',       'https://instagram.com/whiskyboom', 'URL de Instagram'),
  ('facebook_url',        '',                        'URL de Facebook'),
  ('contact_email',       'hola@whiskyboom.com.ar',  'Email de contacto'),
  ('shipping_min_amount', '50000',                   'Monto mínimo para envío gratis (ARS)')
ON CONFLICT (key) DO NOTHING;


-- ================================================================
-- PASO 11: TABLAS ORDERS + ORDER_ITEMS
-- ================================================================
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT UNIQUE NOT NULL DEFAULT 'WB-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT,
  shipping_address TEXT,
  status           order_status DEFAULT 'pending',
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_admin_all" ON orders;
CREATE POLICY "orders_admin_all" ON orders FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT,
  quantity     INT NOT NULL DEFAULT 1,
  unit_price   NUMERIC(12,2) NOT NULL,
  subtotal     NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_items_admin_all" ON order_items;
CREATE POLICY "order_items_admin_all" ON order_items FOR ALL USING (auth.role() = 'authenticated');


-- ================================================================
-- PASO 12: NEWSLETTER_SUBSCRIBERS
-- ================================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "newsletter_public_insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_read"    ON newsletter_subscribers;
DROP POLICY IF EXISTS "newsletter_admin_update"  ON newsletter_subscribers;
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_admin_read"    ON newsletter_subscribers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "newsletter_admin_update"  ON newsletter_subscribers FOR UPDATE USING (auth.role() = 'authenticated');


-- ================================================================
-- PASO 13: CART_CROSS_SELLING
-- ================================================================
CREATE TABLE IF NOT EXISTS cart_cross_selling (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      TEXT DEFAULT 'Más vendido',
  sort_order INT DEFAULT 0,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cart_cross_selling ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cross_sell_public_read" ON cart_cross_selling;
DROP POLICY IF EXISTS "cross_sell_admin_write" ON cart_cross_selling;
CREATE POLICY "cross_sell_public_read" ON cart_cross_selling FOR SELECT USING (is_active = true);
CREATE POLICY "cross_sell_admin_write" ON cart_cross_selling FOR ALL USING (auth.role() = 'authenticated');


-- ================================================================
-- PASO 14: PRODUCTOS DE EJEMPLO (8 whiskies)
-- ================================================================
INSERT INTO products (
  slug, name, brand, category, region, age, abv, volume,
  price, original_price, badge, description, tasting_notes,
  in_stock, stock_quantity, rating, reviews, is_featured, is_top_seller
) VALUES
  ('macallan-12-double-cask',
   'The Macallan Double Cask 12 Years', 'The Macallan',
   'Single Malt Escocés', 'Speyside', 12, 40, 700,
   89990, NULL, 'new',
   'Madurado en barricas de roble americano y europeo con cera de jerez González Byass.',
   'Vainilla, caramelo, especias dulces y un toque de frutos secos.',
   true, 24, 4.8, 124, true, true),

  ('glenfiddich-15',
   'Glenfiddich 15 Year Old Solera', 'Glenfiddich',
   'Single Malt Escocés', 'Speyside', 15, 40, 700,
   74990, 89990, 'sale',
   'Sistema Solera único que combina whiskies de tres tipos de barricas distintas.',
   'Miel, jengibre, toffee con final cálido y suave.',
   true, 12, 4.7, 98, true, false),

  ('laphroaig-10',
   'Laphroaig 10 Year Old', 'Laphroaig',
   'Single Malt Escocés', 'Islay', 10, 40, 700,
   64990, NULL, NULL,
   'El sabor más ahumado de Islay. Notas de turba, algas marinas y vainilla.',
   'Turba intensa, algas marinas, vainilla y un final largo y ahumado.',
   true, 18, 4.9, 210, true, true),

  ('johnnie-walker-blue',
   'Johnnie Walker Blue Label', 'Johnnie Walker',
   'Blended Escocés', 'Escocia', NULL, 40, 700,
   229990, NULL, 'limited',
   'La cúspide del arte de mezcla. Elegancia excepcional en cada sorbo.',
   'Seda, vainilla, fruta suave y especias exóticas.',
   true, 4, 4.9, 87, true, false),

  ('monkey-shoulder',
   'Monkey Shoulder Blended Malt', 'Monkey Shoulder',
   'Blended Malt', 'Speyside', NULL, 40, 700,
   39990, NULL, 'new',
   'Mezcla suave y cremosa de tres single malts de Speyside.',
   'Naranja, vainilla, miel y especias suaves.',
   true, NULL, 4.6, 156, false, false),

  ('jack-daniels-single-barrel',
   'Jack Daniel''s Single Barrel', 'Jack Daniel''s',
   'Bourbon & Tennessee', 'Tennessee, USA', NULL, 45, 700,
   54990, NULL, NULL,
   'Seleccionado a mano de barricas individuales en la cima del almacén.',
   'Roble tostado, caramelo, vainilla y regaliz.',
   true, 8, 4.7, 73, false, false),

  ('highland-park-12',
   'Highland Park 12 Year Old Viking Honour', 'Highland Park',
   'Single Malt Escocés', 'Orkney', 12, 40, 700,
   59990, 69990, 'sale',
   'El equilibrio perfecto entre ahumado y suavidad. Herencia vikinga de Orkney.',
   'Brezo, especias, naranja y un suave ahumado con final dulce.',
   true, NULL, 4.8, 91, false, false),

  ('glenfarclas-105',
   'Glenfarclas 105 Cask Strength', 'Glenfarclas',
   'Single Malt Escocés', 'Speyside', NULL, 60, 700,
   79990, NULL, 'limited',
   'Potencia de barrica completa. Madurado en jerez Oloroso, rico y complejo.',
   'Jerez, frutas pasas, chocolate oscuro y especias intensas.',
   false, 0, 4.9, 44, false, false)

ON CONFLICT (slug) DO NOTHING;


-- ================================================================
-- ✅ FIN — Base de datos lista para Whiskyboom
-- ================================================================

-- ================================================================
-- PASO EXTRA: STORAGE BUCKETS (Imágenes de productos)
-- ================================================================

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de seguridad para los archivos
-- Permitir a cualquier usuario leer (ver las imágenes)
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

-- Permitir a usuarios autenticados subir/modificar/borrar imágenes
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Authenticated users can delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
