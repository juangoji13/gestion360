import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export function useClients() {
    const { business } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchClients = useCallback(async () => {
        if (!business?.id) return;
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('clients')
                .select('*')
                .eq('business_id', business?.id)
                .order('name');

            if (fetchError) throw fetchError;

            const { data: invoices, error: invError } = await supabase
                .from('invoices')
                .select('client_id, total, amount_paid, status, created_at')
                .eq('business_id', business?.id)
                .order('created_at', { ascending: false });

            if (invError) throw invError;

            const clientsWithStats = (data || []).map(client => {
                const clientInvoices = (invoices || []).filter(inv => inv.client_id === client.id);

                const balance = clientInvoices
                    .filter(inv => inv.status !== 'paid')
                    .reduce((sum, inv) => {
                        const total = parseFloat(inv.total) || 0;
                        const paid = parseFloat(inv.amount_paid) || 0;
                        return sum + Math.max(0, total - paid);
                    }, 0);

                const lastSale = clientInvoices[0]?.created_at || null;

                return { ...client, balance, lastSale };
            });

            setClients(clientsWithStats);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [business?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchClients();
        }, [fetchClients])
    );

    async function createClient(clientData) {
        try {
            const sanitizedData = Object.fromEntries(
                Object.entries(clientData).map(([key, value]) => [
                    key, 
                    typeof value === 'string' && value.trim() === '' ? null : value
                ])
            );

            const { data, error: createError } = await supabase
                .from('clients')
                .insert([{ ...sanitizedData, business_id: business?.id }])
                .select();

            if (createError) throw createError;
            await fetchClients();
            return { data: data[0], error: null };
        } catch (err) {
            return { data: null, error: err.message };
        }
    }

    async function updateClient(id, clientData) {
        try {
            const sanitizedData = Object.fromEntries(
                Object.entries(clientData).map(([key, value]) => [
                    key, 
                    typeof value === 'string' && value.trim() === '' ? null : value
                ])
            );

            const { data, error: updateError } = await supabase
                .from('clients')
                .update(sanitizedData)
                .eq('id', id)
                .select();

            if (updateError) throw updateError;
            await fetchClients();
            return { data: data[0], error: null };
        } catch (err) {
            return { data: null, error: err.message };
        }
    }

    return { clients, loading, error, refresh: fetchClients, updateClient, createClient };
}
