-- ============================================
-- STORAGE - Logo Upload
-- ============================================
-- Ejecuta esto en el SQL Editor de Supabase
-- para crear el bucket de logos

-- Crear bucket público para logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: cualquier usuario autenticado puede subir
CREATE POLICY "Users can upload logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos' AND auth.role() = 'authenticated'
  );

-- Política: cualquier usuario autenticado puede actualizar su logo
CREATE POLICY "Users can update logos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos' AND auth.role() = 'authenticated'
  );

-- Política: logos son públicos (para mostrar en facturas)
CREATE POLICY "Logos are public" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

-- Política: usuarios pueden eliminar sus logos
CREATE POLICY "Users can delete logos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos' AND auth.role() = 'authenticated'
  );
