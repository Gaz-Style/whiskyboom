-- ============================================================
-- INSERTAR PÁGINA DE BLOG EN CUSTOM_PAGES
-- ============================================================

INSERT INTO custom_pages (title, slug, blocks, is_active)
VALUES ('Blog', 'blog', '[]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;
