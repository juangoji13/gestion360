-- ============================================
-- ERP FACTURACIÓN - Blindaje de Seguridad (Hotfix)
-- ============================================
-- EJECUTA ESTE SCRIPT PARA ASEGURAR TU SISTEMA

-- 1. Versión Blindada de create_invoice_final
CREATE OR REPLACE FUNCTION create_invoice_final(
    p_invoice JSONB,
    p_items JSONB[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Mantenemos DEFINER para bypass RLS interno PERO con validación manual
AS $$
DECLARE
    v_invoice_id UUID;
    v_business_id UUID;
    v_calculated_subtotal NUMERIC := 0;
    v_calculated_tax NUMERIC := 0;
    v_calculated_total NUMERIC := 0;
    v_item_total NUMERIC;
    v_item JSONB;
    v_next_num TEXT;
    v_last_num INT;
    v_result JSONB;
    v_user_id UUID;
BEGIN
    -- SEGURIDAD 1: Validar que el negocio pertenece al usuario logueado
    v_business_id := (p_invoice->>'business_id')::UUID;
    v_user_id := auth.uid();

    IF NOT EXISTS (
        SELECT 1 FROM businesses 
        WHERE id = v_business_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'Acceso denegado: No tienes permisos sobre este negocio.';
    END IF;

    -- SEGURIDAD 2: Bloqueo de fila para consistencia
    PERFORM id FROM businesses WHERE id = v_business_id FOR UPDATE;

    -- Generar Numero de Factura
    SELECT COALESCE(
        MAX(CAST(substring(invoice_number FROM 'FAC-(\d+)') AS INTEGER)), 
        0
    ) INTO v_last_num
    FROM invoices 
    WHERE business_id = v_business_id;

    v_next_num := 'FAC-' || LPAD((v_last_num + 1)::TEXT, 4, '0');

    -- SEGURIDAD 3: Recalcular TODO en el servidor (Zero Trust)
    FOREACH v_item IN ARRAY p_items
    LOOP
        v_item_total := (v_item->>'quantity')::NUMERIC * (v_item->>'unit_price')::NUMERIC;
        v_calculated_subtotal := v_calculated_subtotal + v_item_total;
    END LOOP;

    -- Calcular Impuestos y Total Final (aplicando descuento si existe)
    v_calculated_tax := (v_calculated_subtotal - COALESCE((p_invoice->>'discount_amount')::NUMERIC, 0)) * (COALESCE((p_invoice->>'tax_rate')::NUMERIC, 0) / 100);
    v_calculated_total := v_calculated_subtotal - COALESCE((p_invoice->>'discount_amount')::NUMERIC, 0) + v_calculated_tax;

    -- Insertar Factura con valores CALCULADOS POR EL SERVIDOR
    INSERT INTO invoices (
        business_id, client_id, invoice_number, date, due_date, 
        subtotal, tax_rate, tax_amount, total, status, notes
    ) VALUES (
        v_business_id,
        (p_invoice->>'client_id')::UUID,
        v_next_num,
        (p_invoice->>'date')::DATE,
        (p_invoice->>'due_date')::DATE,
        v_calculated_subtotal,
        COALESCE((p_invoice->>'tax_rate')::NUMERIC, 0),
        v_calculated_tax,
        v_calculated_total,
        COALESCE(p_invoice->>'status', 'pending'),
        p_invoice->>'notes'
    ) RETURNING id INTO v_invoice_id;

    -- Insertar Ítems y Ajustar Stock
    FOREACH v_item IN ARRAY p_items
    LOOP
        v_item_total := (v_item->>'quantity')::NUMERIC * (v_item->>'unit_price')::NUMERIC;
        
        INSERT INTO invoice_items (
            invoice_id, product_id, description, quantity, unit_price, total, purchase_price
        ) VALUES (
            v_invoice_id,
            (v_item->>'product_id')::UUID,
            v_item->>'description',
            (v_item->>'quantity')::NUMERIC,
            (v_item->>'unit_price')::NUMERIC,
            v_item_total, -- Usamos el total recalculado
            COALESCE((v_item->>'purchase_price')::NUMERIC, 0)
        );

        -- Restar Stock
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

-- 2. Versión Blindada de Dashboard Stats
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
    v_result JSONB;
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    -- SEGURIDAD: Validar propiedad
    IF NOT EXISTS (
        SELECT 1 FROM businesses 
        WHERE id = p_business_id AND user_id = v_user_id
    ) THEN
        RAISE EXCEPTION 'Acceso denegado.';
    END IF;

    -- El resto de la lógica se mantiene igual ya que el acceso está filtrado por p_business_id
    SELECT jsonb_build_object(
        'totalRevenue', COALESCE(SUM(total), 0),
        'totalInvoices', COUNT(*),
        'pendingCount', COUNT(*) FILTER (WHERE status = 'pending'),
        'paidCount', COUNT(*) FILTER (WHERE status = 'paid'),
        'netProfit', (
            SELECT COALESCE(SUM(ii.total - (ii.purchase_price * ii.quantity)), 0)
            FROM invoice_items ii
            JOIN invoices i ON i.id = ii.invoice_id
            WHERE i.business_id = p_business_id
            AND i.created_at >= p_start_date 
            AND i.created_at <= p_end_date
        )
    ) INTO v_result
    FROM invoices
    WHERE business_id = p_business_id 
    AND created_at >= p_start_date 
    AND created_at <= p_end_date;

    RETURN v_result;
END;
$$;
