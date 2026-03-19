import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export function useInvoices() {
    const { business } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInvoices = useCallback(async () => {
        if (!business?.id) return;
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('invoices')
                .select(`
                    *,
                    client:clients(*),
                    invoice_items(*)
                `)
                .eq('business_id', business?.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setInvoices(data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [business?.id]);

    // Refrescar automáticamente cuando la pantalla gana el foco (vuelve de otra pantalla)
    useFocusEffect(
        useCallback(() => {
            fetchInvoices();
        }, [fetchInvoices])
    );

    async function createInvoice(invoiceData, items) {
        try {
            const { data, error: rpcError } = await supabase.rpc('create_invoice_final', {
                p_invoice: invoiceData,
                p_items: items
            });

            if (rpcError) throw rpcError;
            
            return data;
        } catch (err) {
            throw err;
        }
    }

    async function updateInvoice(invoiceId, invoiceData, items) {
        try {
            const { data, error: rpcError } = await supabase.rpc('update_invoice_final', {
                p_invoice_id: invoiceId,
                p_invoice: invoiceData,
                p_items: items
            });

            if (rpcError) throw rpcError;
            
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
            
        } catch (err) {
            throw err;
        }
    }

    async function addPayment(invoiceId, currentPaid, paymentAmount) {
        try {
            const newTotalPaid = (parseFloat(currentPaid) || 0) + (parseFloat(paymentAmount) || 0);
            
            const { error: updateError } = await supabase
                .from('invoices')
                .update({ amount_paid: newTotalPaid })
                .eq('id', invoiceId);

            if (updateError) throw updateError;
            
        } catch (err) {
            throw err;
        }
    }

    async function deleteInvoice(invoiceId) {
        try {
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
            
            const { error: deleteError } = await supabase.rpc('delete_invoice_final', {
                p_invoice_id: invoiceId
            });

            if (deleteError) {
                fetchInvoices();
                throw deleteError;
            }
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
            return (data || []).map(item => ({
                ...item,
                price: item.unit_price,
                name: item.products?.name || 'Producto eliminado',
                sku: item.products?.sku || 'N/A'
            }));
        } catch (err) {
            console.error('Error fetching invoice items:', err);
            return [];
        }
    }

    const totalPending = (invoices || [])
        .filter(inv => inv.status === 'pending')
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
