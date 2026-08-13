-- ============================================================
-- TABLA: BLOG_POSTS (Entradas del Blog)
-- ============================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  excerpt          TEXT,
  content          TEXT NOT NULL,
  image_url        TEXT,
  is_active        BOOLEAN DEFAULT true,
  published_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para mantener actualizado updated_at
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
DROP POLICY IF EXISTS "blog_public_read" ON blog_posts;
DROP POLICY IF EXISTS "blog_admin_write" ON blog_posts;
CREATE POLICY "blog_public_read" ON blog_posts FOR SELECT USING (is_active = true);
CREATE POLICY "blog_admin_write" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
