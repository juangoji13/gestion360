-- ============================================
-- SUPERUSUARIO / ADMIN - Setup adicional
-- ============================================
-- Ejecuta esto DESPUÉS del supabase-setup.sql original
-- en el SQL Editor de tu proyecto Supabase

-- 1. Tabla de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT DEFAULT 'superadmin' CHECK (role IN ('superadmin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver la tabla de admins
CREATE POLICY "admins_select" ON admins FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- VISTA GLOBAL para el admin dashboard
-- (función SQL que bypasea RLS de forma segura)
-- ============================================

-- Función: obtener estadísticas globales (solo para admins)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  is_admin BOOLEAN;
BEGIN
  -- Verificar que el usuario es admin
  SELECT EXISTS(SELECT 1 FROM admins WHERE user_id = auth.uid()) INTO is_admin;
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Acceso denegado: no eres administrador';
  END IF;

  SELECT json_build_object(
    'total_businesses', (SELECT COUNT(*) FROM businesses),
    'total_clients', (SELECT COUNT(*) FROM clients),
    'total_products', (SELECT COUNT(*) FROM products),
    'total_invoices', (SELECT COUNT(*) FROM invoices),
    'total_revenue', COALESCE((SELECT SUM(total) FROM invoices WHERE status = 'paid'), 0),
    'total_pending', COALESCE((SELECT SUM(total) FROM invoices WHERE status = 'pending'), 0),
    'invoices_paid', (SELECT COUNT(*) FROM invoices WHERE status = 'paid'),
    'invoices_pending', (SELECT COUNT(*) FROM invoices WHERE status = 'pending'),
    'invoices_overdue', (SELECT COUNT(*) FROM invoices WHERE status = 'overdue'),
    'recent_businesses', (
      SELECT COALESCE(json_agg(row_to_json(b)), '[]'::json)
      FROM (
        SELECT b.id, b.name, b.email, b.phone, b.created_at,
               u.email AS user_email,
               (SELECT COUNT(*) FROM invoices i WHERE i.business_id = b.id) AS invoice_count,
               COALESCE((SELECT SUM(total) FROM invoices i WHERE i.business_id = b.id AND i.status = 'paid'), 0) AS revenue
        FROM businesses b
        JOIN auth.users u ON u.id = b.user_id
        ORDER BY b.created_at DESC
        LIMIT 50
      ) b
    ),
    'recent_invoices', (
      SELECT COALESCE(json_agg(row_to_json(inv)), '[]'::json)
      FROM (
        SELECT i.id, i.invoice_number, i.total, i.status, i.date, i.created_at,
               b.name AS business_name,
               c.name AS client_name
        FROM invoices i
        LEFT JOIN businesses b ON b.id = i.business_id
        LEFT JOIN clients c ON c.id = i.client_id
        ORDER BY i.created_at DESC
        LIMIT 20
      ) inv
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================
-- CÓMO AGREGAR UN ADMIN:
-- Primero regístrate con tu email en la app.
-- Luego ejecuta este SQL en el SQL Editor:
--
-- INSERT INTO admins (user_id)
-- SELECT id FROM auth.users WHERE email = 'TU-EMAIL@ejemplo.com';
-- ============================================
