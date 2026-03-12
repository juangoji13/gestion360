import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export function useClients() {
    const { business } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function fetchClients() {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('clients')
                .select('*')
                .eq('business_id', business?.id)
                .order('name');

            if (fetchError) throw fetchError;

            // Calculamos el balance pendiente y la última venta para cada cliente
            const { data: invoices, error: invError } = await supabase
                .from('invoices')
                .select('client_id, total, amount_paid, status, created_at')
                .eq('business_id', business?.id)
                .order('created_at', { ascending: false });

            if (invError) throw invError;

            const clientsWithStats = data.map(client => {
                const clientInvoices = invoices.filter(inv => inv.client_id === client.id);

                // Balance pendiente (solo facturas no pagadas)
                const balance = clientInvoices
                    .filter(inv => inv.status !== 'paid')
                    .reduce((sum, inv) => {
                        const total = parseFloat(inv.total) || 0;
                        const paid = parseFloat(inv.amount_paid) || 0;
                        return sum + Math.max(0, total - paid);
                    }, 0);

                // Fecha de la última venta
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
    }

    useEffect(() => {
        if (business?.id) fetchClients();
    }, [business?.id]);

    return { clients, loading, error, refresh: fetchClients };
}
