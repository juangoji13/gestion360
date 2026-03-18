-- ============================================
-- ERP FACTURACIÓN - DBA OPTIMIZATION SCRIPT
-- ============================================
-- EJECUTA ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE

-- ============================================
-- 1. OPTIMIZACIÓN DE ÍNDICES (Dashboard Fast-Load)
-- ============================================

-- Índices compuestos para analíticas del Dashboard (O(log N) scan)
-- Usamos omitimos si estamos en una transacción implícita, pero en scripts sueltos es mejor para no bloquear la tabla en producción.
CREATE INDEX IF NOT EXISTS idx_invoices_biz_created ON invoices(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_biz_status ON invoices(business_id, status);

-- Índice individual para ítems (Foreign Key optimizada para joins)
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON invoice_items(product_id);

-- ============================================
-- 2. REFACTORIZACIÓN RLS (O(1) Short-Circuit con EXISTS)
-- ============================================

-- -----------------------
-- TABLA: CLIENTS
-- -----------------------
DROP POLICY IF EXISTS "clients_select" ON clients;
DROP POLICY IF EXISTS "clients_insert" ON clients;
DROP POLICY IF EXISTS "clients_update" ON clients;
DROP POLICY IF EXISTS "clients_delete" ON clients;

CREATE POLICY "clients_select" ON clients FOR SELECT USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = clients.business_id AND b.user_id = auth.uid())
);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = clients.business_id AND b.user_id = auth.uid())
);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = clients.business_id AND b.user_id = auth.uid())
);

-- -----------------------
-- TABLA: PRODUCTS
-- -----------------------
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;

CREATE POLICY "products_select" ON products FOR SELECT USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = products.business_id AND b.user_id = auth.uid())
);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY "products_update" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = products.business_id AND b.user_id = auth.uid())
);
CREATE POLICY "products_delete" ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = products.business_id AND b.user_id = auth.uid())
);

-- -----------------------
-- TABLA: INVOICES
-- -----------------------
DROP POLICY IF EXISTS "invoices_select" ON invoices;
DROP POLICY IF EXISTS "invoices_insert" ON invoices;
DROP POLICY IF EXISTS "invoices_update" ON invoices;
DROP POLICY IF EXISTS "invoices_delete" ON invoices;

CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = invoices.business_id AND b.user_id = auth.uid())
);
CREATE POLICY "invoices_insert" ON invoices FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
);
CREATE POLICY "invoices_update" ON invoices FOR UPDATE USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = invoices.business_id AND b.user_id = auth.uid())
);
CREATE POLICY "invoices_delete" ON invoices FOR DELETE USING (
  EXISTS (SELECT 1 FROM businesses b WHERE b.id = invoices.business_id AND b.user_id = auth.uid())
);

-- -----------------------
-- TABLA: INVOICE_ITEMS
-- -----------------------
DROP POLICY IF EXISTS "invoice_items_select" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_update" ON invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete" ON invoice_items;

-- Reduciendo el doble IN() a un solo EXISTS anidado
CREATE POLICY "invoice_items_select" ON invoice_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM invoices i 
    JOIN businesses b ON b.id = i.business_id 
    WHERE i.id = invoice_items.invoice_id AND b.user_id = auth.uid()
  )
);
CREATE POLICY "invoice_items_insert" ON invoice_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM invoices i 
    JOIN businesses b ON b.id = i.business_id 
    WHERE i.id = invoice_id AND b.user_id = auth.uid()
  )
);
CREATE POLICY "invoice_items_update" ON invoice_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM invoices i 
    JOIN businesses b ON b.id = i.business_id 
    WHERE i.id = invoice_items.invoice_id AND b.user_id = auth.uid()
  )
);
CREATE POLICY "invoice_items_delete" ON invoice_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM invoices i 
    JOIN businesses b ON b.id = i.business_id 
    WHERE i.id = invoice_items.invoice_id AND b.user_id = auth.uid()
  )
);
