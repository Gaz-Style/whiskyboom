-- ============================================================
--  WHISKYBOOM — Schema Extendido (Ejecutar DESPUÉS del schema.sql base)
--  Supabase → SQL Editor → New Query
-- ============================================================


-- ============================================================
-- TABLA: BANNERS (ProomoBanners administrables)
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  subtitle    TEXT,
  cta_text    TEXT DEFAULT 'Ver más',
  href        TEXT NOT NULL DEFAULT '/',
  image_url   TEXT,
  dark        BOOLEAN DEFAULT true,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_public_read" ON banners FOR SELECT USING (true);
CREATE POLICY "banners_admin_write" ON banners FOR ALL USING (auth.role() = 'authenticated');

-- Datos iniciales: los 3 banners actuales de PromoBanners.tsx
INSERT INTO banners (title, subtitle, cta_text, href, dark, sort_order) VALUES
  ('Grandes Ofertas',     'Hasta 30% OFF en selección especial',  'Ver Ofertas',   '/ofertas',                  true,  1),
  ('Nuevas Llegadas',     'Descubrí las últimas incorporaciones', 'Ver Novedades', '/productos?badge=new',       false, 2),
  ('Ediciones Limitadas', 'Botellas únicas para coleccionistas',  'Ver Colección', '/productos?categoria=limitado', true, 3)
ON CONFLICT DO NOTHING;


-- ============================================================
-- TABLA: SITE_SETTINGS (Configuración del sitio)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_write" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Valores por defecto
INSERT INTO site_settings (key, value, description) VALUES
  ('announcement_text',    '🥃 Envío gratis en compras mayores a $50.000 · Pago en hasta 12 cuotas sin interés', 'Texto del announcement bar'),
  ('announcement_active',  'true',            'Mostrar/ocultar el announcement bar'),
  ('announcement_color',   '#8B1A1A',         'Color de fondo del announcement bar'),
  ('instagram_url',        'https://instagram.com/whiskyboom', 'URL de Instagram'),
  ('facebook_url',         '',                'URL de Facebook'),
  ('twitter_url',          '',                'URL de Twitter'),
  ('contact_email',        'hola@whiskyboom.com.ar', 'Email de contacto'),
  ('contact_phone',        '+54 11 0000-0000', 'Teléfono de contacto'),
  ('contact_address',      'Buenos Aires, Argentina', 'Dirección'),
  ('shipping_min_amount',  '50000',           'Monto mínimo para envío gratis (ARS)'),
  ('shipping_free_text',   'Envío gratis en compras mayores a $50.000', 'Texto de envío gratis'),
  ('meta_title',           'Whiskyboom | Tienda de Whisky Premium en Argentina', 'Título SEO por defecto'),
  ('meta_description',     'Descubrí la mejor selección de whiskies premium', 'Descripción SEO por defecto')
ON CONFLICT (key) DO NOTHING;


-- ============================================================
-- TABLA: ORDERS (Pedidos)
-- ============================================================
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT UNIQUE NOT NULL DEFAULT 'WB-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  customer_name   TEXT NOT NULL,
  customer_email  TEXT NOT NULL,
  customer_phone  TEXT,
  shipping_address TEXT,
  status          order_status DEFAULT 'pending',
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_email      ON orders(customer_email);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_admin_all" ON orders FOR ALL USING (auth.role() = 'authenticated');


-- ============================================================
-- TABLA: ORDER_ITEMS (Líneas de pedido)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12,2) NOT NULL,
  subtotal    NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_admin_all" ON order_items FOR ALL USING (auth.role() = 'authenticated');


-- ============================================================
-- TABLA: NEWSLETTER_SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "newsletter_public_insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "newsletter_admin_read"   ON newsletter_subscribers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "newsletter_admin_update" ON newsletter_subscribers FOR UPDATE USING (auth.role() = 'authenticated');


-- ============================================================
-- VISTA: admin_product_stats (útil para el dashboard)
-- ============================================================
CREATE OR REPLACE VIEW admin_product_stats AS
SELECT
  COUNT(*)                                          AS total_products,
  COUNT(*) FILTER (WHERE in_stock = false)          AS out_of_stock,
  COUNT(*) FILTER (WHERE badge = 'new')             AS new_products,
  COUNT(*) FILTER (WHERE badge = 'sale')            AS on_sale,
  COUNT(*) FILTER (WHERE badge = 'limited')         AS limited_products,
  COUNT(*) FILTER (WHERE is_featured = true)        AS featured_products,
  ROUND(AVG(price)::numeric, 0)                     AS avg_price,
  MIN(price)                                        AS min_price,
  MAX(price)                                        AS max_price
FROM products;
