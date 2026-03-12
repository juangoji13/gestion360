-- ============================================
-- ERP FACTURACIÓN - Profesionalización Core
-- ============================================
-- EJECUTA ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE

-- 1. Soporte para Ganancia Histórica (Problema 7)
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC DEFAULT 0;

-- 2. Nueva Columna de Stock en Productos (si no existía)
-- Ya debe existir pero nos aseguramos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock NUMERIC DEFAULT 0;

-- 3. Función Atómica: Crear Factura, Ítems y Ajustar Stock (Problemas 1, 3 y 4)
CREATE OR REPLACE FUNCTION create_invoice_final(
    p_invoice JSONB,
    p_items JSONB[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invoice_id UUID;
    v_business_id UUID;
    v_next_num TEXT;
    v_last_num INT;
    v_item JSONB;
    v_result JSONB;
BEGIN
    v_business_id := (p_invoice->>'business_id')::UUID;

    -- Bloqueo de fila para evitar que dos usuarios generen el mismo número (Problema 1)
    PERFORM id FROM businesses WHERE id = v_business_id FOR UPDATE;

    -- Generar Numero de Factura Atómico
    SELECT COALESCE(
        MAX(CAST(substring(invoice_number FROM 'FAC-(\d+)') AS INTEGER)), 
        0
    ) INTO v_last_num
    FROM invoices 
    WHERE business_id = v_business_id;

    v_next_num := 'FAC-' || LPAD((v_last_num + 1)::TEXT, 4, '0');

    -- Insertar Factura
    INSERT INTO invoices (
        business_id, client_id, invoice_number, date, due_date, 
        subtotal, tax_rate, tax_amount, total, status, notes
    ) VALUES (
        v_business_id,
        (p_invoice->>'client_id')::UUID,
        v_next_num,
        (p_invoice->>'date')::DATE,
        (p_invoice->>'due_date')::DATE,
        (p_invoice->>'subtotal')::NUMERIC,
        (p_invoice->>'tax_rate')::NUMERIC,
        (p_invoice->>'tax_amount')::NUMERIC,
        (p_invoice->>'total')::NUMERIC,
        COALESCE(p_invoice->>'status', 'pending'),
        p_invoice->>'notes'
    ) RETURNING id INTO v_invoice_id;

    -- Insertar Ítems y Restar Stock (Problema 3 y 4)
    FOREACH v_item IN ARRAY p_items
    LOOP
        -- Insertar ítem con el costo actual capturado (Problema 7)
        INSERT INTO invoice_items (
            invoice_id, product_id, description, quantity, unit_price, total, purchase_price
        ) VALUES (
            v_invoice_id,
            (v_item->>'product_id')::UUID,
            v_item->>'description',
            (v_item->>'quantity')::NUMERIC,
            (v_item->>'unit_price')::NUMERIC,
            (v_item->>'total')::NUMERIC,
            COALESCE((v_item->>'purchase_price')::NUMERIC, 0)
        );

        -- Restar Stock si hay product_id
        IF (v_item->>'product_id') IS NOT NULL AND (v_item->>'product_id') != '' THEN
            UPDATE products 
            SET stock = stock - (v_item->>'quantity')::NUMERIC
            WHERE id = (v_item->>'product_id')::UUID;
        END IF;
    END LOOP;

    SELECT row_to_json(inv) INTO v_result 
    FROM (SELECT * FROM invoices WHERE id = v_invoice_id) inv;

    RETURN v_result;
END;
$$;

-- 4. Estadísticas de Dashboard Optimizadas (Problema 5)
CREATE OR REPLACE FUNCTION get_dashboard_stats_v2(
    p_business_id UUID,
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_revenue NUMERIC;
    v_total_profit NUMERIC;
    v_pending_count INT;
    v_paid_count INT;
    v_total_invoices INT;
BEGIN
    SELECT 
        COALESCE(SUM(total), 0),
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'pending'),
        COUNT(*) FILTER (WHERE status = 'paid')
    INTO 
        v_total_revenue, v_total_invoices, v_pending_count, v_paid_count
    FROM invoices
    WHERE business_id = p_business_id 
    AND created_at >= p_start_date 
    AND created_at <= p_end_date;

    -- Cálculo de ganancia neta profesional (Problema 7)
    SELECT 
        COALESCE(SUM(ii.total - (ii.purchase_price * ii.quantity)), 0)
    INTO v_total_profit
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.business_id = p_business_id
    AND i.created_at >= p_start_date 
    AND i.created_at <= p_end_date;

    RETURN jsonb_build_object(
        'totalRevenue', v_total_revenue,
        'netProfit', v_total_profit,
        'pendingCount', v_pending_count,
        'paidCount', v_paid_count,
        'totalInvoices', v_total_invoices
    );
END;
$$;
