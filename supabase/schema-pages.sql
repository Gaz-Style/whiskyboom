-- ============================================================
-- TABLA: CUSTOM_PAGES (Páginas autoadministrables / CMS)
-- ============================================================

CREATE TABLE IF NOT EXISTS custom_pages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  blocks           JSONB DEFAULT '[]'::jsonb,
  is_active        BOOLEAN DEFAULT true,
  meta_title       TEXT,
  meta_description TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para mantener actualizado updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS custom_pages_updated_at ON custom_pages;
CREATE TRIGGER custom_pages_updated_at
  BEFORE UPDATE ON custom_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE custom_pages ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad
DROP POLICY IF EXISTS "pages_public_read" ON custom_pages;
DROP POLICY IF EXISTS "pages_admin_write" ON custom_pages;
CREATE POLICY "pages_public_read" ON custom_pages FOR SELECT USING (is_active = true);
CREATE POLICY "pages_admin_write" ON custom_pages FOR ALL USING (auth.role() = 'authenticated');
