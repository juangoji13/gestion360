import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export function useInvoices() {
    const { business } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchInvoices() {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('invoices')
                .select(`
                    *,
                    client:clients(name)
                `)
                .eq('business_id', business?.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setInvoices(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function createInvoice(invoiceData, items) {
        try {
            const { data, error: rpcError } = await supabase.rpc('create_invoice_final', {
                p_invoice: invoiceData,
                p_items: items
            });

            if (rpcError) throw rpcError;
            await fetchInvoices();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async function updateStatus(invoiceId, newStatus) {
        try {
            const { error: updateError } = await supabase
                .from('invoices')
                .update({ status: newStatus })
                .eq('id', invoiceId);

            if (updateError) throw updateError;
            await fetchInvoices();
        } catch (err) {
            throw err;
        }
    }

    async function addPayment(invoiceId, currentPaid, paymentAmount) {
        try {
            const newTotalPaid = (parseFloat(currentPaid) || 0) + (parseFloat(paymentAmount) || 0);
            
            // Si el nuevo total pagado es mayor o igual al total de la factura, marcamos como paid
            // Pero primero necesitamos el total de la factura. Como no lo tenemos aquí directamente,
            // la lógica de negocio suele estar en el servidor o se calcula antes de llamar.
            // Para simplicidad, actualizamos el monto pagado.
            
            const { error: updateError } = await supabase
                .from('invoices')
                .update({ amount_paid: newTotalPaid })
                .eq('id', invoiceId);

            if (updateError) throw updateError;
            await fetchInvoices();
        } catch (err) {
            throw err;
        }
    }

    async function deleteInvoice(invoiceId) {
        try {
            const { error: deleteError } = await supabase
                .from('invoices')
                .delete()
                .eq('id', invoiceId);

            if (deleteError) throw deleteError;
            await fetchInvoices();
        } catch (err) {
            throw err;
        }
    }

    async function fetchInvoiceItems(invoiceId) {
        try {
            const { data, error } = await supabase
                .from('invoice_items')
                .select('*, products(name, sku)')
                .eq('invoice_id', invoiceId);

            if (error) throw error;
            return data.map(item => ({
                ...item,
                name: item.products?.name || 'Producto eliminado',
                sku: item.products?.sku || 'N/A'
            }));
        } catch (err) {
            console.error('Error fetching invoice items:', err);
            return [];
        }
    }

    useEffect(() => {
        if (business?.id) fetchInvoices();
    }, [business?.id]);

    const totalPending = invoices
        .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
        .reduce((sum, inv) => {
            const total = parseFloat(inv.total) || 0;
            const paid = parseFloat(inv.amount_paid) || 0;
            return sum + Math.max(0, total - paid);
        }, 0);

    return { 
        invoices, 
        loading, 
        error, 
        totalPending, 
        createInvoice, 
        updateStatus,
        addPayment,
        deleteInvoice,
        fetchInvoiceItems,
        fetchInvoices,
        refresh: fetchInvoices 
    };
}
