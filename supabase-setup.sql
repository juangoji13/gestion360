-- ============================================
-- ERP FACTURACION - Supabase Database Setup
-- ============================================
-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- https://supabase.com/dashboard → SQL Editor

-- 1. Tabla de negocios (un negocio por usuario)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  default_tax_rate NUMERIC DEFAULT 19,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_business_user UNIQUE (user_id)
);

-- 2. Tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  sale_price NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'und',
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 19,
  tax_amount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_invoice_num_per_biz UNIQUE (business_id, invoice_number)
);

-- 5. Tabla de items de factura
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  description TEXT,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (Multi-Tenant Isolation)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- BUSINESSES: solo el dueño puede ver/modificar
CREATE POLICY "businesses_select" ON businesses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "businesses_insert" ON businesses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "businesses_update" ON businesses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "businesses_delete" ON businesses FOR DELETE USING (auth.uid() = user_id);

-- CLIENTS: solo el dueño del negocio puede ver/modificar
CREATE POLICY "clients_select" ON clients FOR SELECT USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "clients_insert" ON clients FOR INSERT WITH CHECK (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "clients_update" ON clients FOR UPDATE USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "clients_delete" ON clients FOR DELETE USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);

-- PRODUCTS: solo el dueño del negocio
CREATE POLICY "products_select" ON products FOR SELECT USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "products_update" ON products FOR UPDATE USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "products_delete" ON products FOR DELETE USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);

-- INVOICES: solo el dueño del negocio
CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "invoices_insert" ON invoices FOR INSERT WITH CHECK (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "invoices_update" ON invoices FOR UPDATE USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);
CREATE POLICY "invoices_delete" ON invoices FOR DELETE USING (
  business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
);

-- INVOICE_ITEMS: acceso via facturas del negocio
CREATE POLICY "invoice_items_select" ON invoice_items FOR SELECT USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "invoice_items_insert" ON invoice_items FOR INSERT WITH CHECK (
  invoice_id IN (
    SELECT id FROM invoices WHERE business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "invoice_items_update" ON invoice_items FOR UPDATE USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "invoice_items_delete" ON invoice_items FOR DELETE USING (
  invoice_id IN (
    SELECT id FROM invoices WHERE business_id IN (
      SELECT id FROM businesses WHERE user_id = auth.uid()
    )
  )
);

-- ============================================
-- INDEXES para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_businesses_user_id ON businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_business_id ON clients(business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_business_id ON invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
