import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export function useStats() {
    const { business } = useAuth();
    const [stats, setStats] = useState({
        totalIncome: 0,
        netProfit: 0,
        pendingInvoices: 0,
        paidInvoices: 0,
        chartData: {
            labels: ['Lun', 'Mar', 'Mié', 'Juv', 'Vie', 'Sáb', 'Dom'],
            datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }, { data: [0, 0, 0, 0, 0, 0, 0] }]
        },
        loading: true,
        error: null
    });

    async function fetchStats(range = '7d') {
        try {
            setStats(prev => ({ ...prev, loading: true }));

            const now = new Date();
            let startDate, endDate = now.toISOString();

            if (range === 'today') {
                startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            } else if (range === '7d') {
                startDate = new Date(new Date().setDate(now.getDate() - 7)).toISOString();
            } else if (range === '30d') {
                startDate = new Date(new Date().setDate(now.getDate() - 30)).toISOString();
            } else {
                startDate = new Date(now.getFullYear(), 0, 1).toISOString();
            }

            // 1. Fetch Aggregated Stats via RPC
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_dashboard_stats_v2', {
                p_business_id: business.id,
                p_start_date: startDate,
                p_end_date: endDate
            });

            if (rpcError) throw rpcError;

            // 2. Fetch Time-Series Data (Invoices for the period)
            const { data: invoices, error: invError } = await supabase
                .from('invoices')
                .select('total, profitability, created_at')
                .eq('business_id', business.id)
                .gte('created_at', startDate)
                .order('created_at', { ascending: true });

            if (invError) throw invError;

            // 3. Process Chart Data (Simplificado para 7 días como ejemplo base)
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return {
                    label: days[d.getDay()],
                    dateStr: d.toISOString().split('T')[0],
                    income: 0,
                    profit: 0
                };
            });

            invoices.forEach(inv => {
                const dateStr = inv.created_at.split('T')[0];
                const dayMatch = last7Days.find(d => d.dateStr === dateStr);
                if (dayMatch) {
                    dayMatch.income += parseFloat(inv.total) || 0;
                    dayMatch.profit += parseFloat(inv.profitability) || 0;
                }
            });

            setStats({
                totalIncome: rpcData.totalRevenue || 0,
                netProfit: rpcData.netProfit || 0,
                pendingInvoices: rpcData.pendingCount || 0,
                paidInvoices: rpcData.paidCount || 0,
                chartData: {
                    labels: last7Days.map(d => d.label),
                    datasets: [
                        { data: last7Days.map(d => d.income), color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})` }, // Primary
                        { data: last7Days.map(d => d.profit), color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})` }  // Secondary
                    ],
                    legend: ["Ingresos", "Ganancias"]
                },
                loading: false,
                error: null
            });
        } catch (err) {
            setStats(prev => ({ ...prev, loading: false, error: err.message }));
        }
    }

    useEffect(() => {
        if (business?.id) fetchStats();
    }, [business?.id]);

    return { ...stats, refresh: fetchStats };
}
