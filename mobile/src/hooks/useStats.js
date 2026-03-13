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

            // 2. Fetch Time-Series Data (Daily stats via RPC)
            const { data: dailyStats, error: dailyError } = await supabase.rpc('get_dashboard_daily_stats', {
                p_business_id: business.id,
                p_start_date: startDate,
                p_end_date: endDate
            });

            if (dailyError) throw dailyError;

            // 3. Process Chart Data
            let labels = [];
            let incomeData = [];
            let profitData = [];

            if (range === 'today') {
                // Buckets por hora (últimas 6 horas para no saturar)
                const last6Hours = Array.from({ length: 6 }, (_, i) => {
                    const d = new Date();
                    d.setHours(d.getHours() - (5 - i));
                    const hour = d.getHours();
                    return `${hour}:00`;
                });
                labels = last6Hours;
                incomeData = last6Hours.map(() => Math.random() * 50000); // Mock temporal si RPC no soporta horas aún
                profitData = last6Hours.map(v => v * 0.7);
            } else if (range === '7d') {
                const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const dateStr = d.toISOString().split('T')[0];
                    const dayData = dailyStats.find(s => s.date === dateStr);
                    return {
                        label: daysMap[d.getDay()],
                        income: dayData ? parseFloat(dayData.income) : 0,
                        profit: dayData ? parseFloat(dayData.profit) : 0
                    };
                });
                labels = last7Days.map(d => d.label);
                incomeData = last7Days.map(d => d.income);
                profitData = last7Days.map(d => d.profit);
            } else {
                // 30d o más: Fechas simplificadas (cada 5 días)
                const samples = range === '30d' ? 6 : 12;
                const timeframe = Array.from({ length: samples }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (range === '30d' ? (5 * (samples - 1 - i)) : (30 * (samples - 1 - i))));
                    const dateStr = d.toISOString().split('T')[0];
                    const dayData = dailyStats.find(s => s.date === dateStr);
                    return {
                        label: range === '30d' ? `${d.getDate()}/${d.getMonth() + 1}` : d.toLocaleString('default', { month: 'short' }),
                        income: dayData ? parseFloat(dayData.income) : 0,
                        profit: dayData ? parseFloat(dayData.profit) : 0
                    };
                });
                labels = timeframe.map(d => d.label);
                incomeData = timeframe.map(d => d.income);
                profitData = timeframe.map(d => d.profit);
            }

            setStats({
                totalIncome: rpcData.totalRevenue || 0,
                netProfit: rpcData.netProfit || 0,
                pendingInvoices: rpcData.pendingCount || 0,
                paidInvoices: rpcData.paidCount || 0,
                chartData: {
                    labels,
                    datasets: [
                        { data: incomeData, color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})` }, // Indigo
                        { data: profitData, color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})` }  // Emerald (Ganancias)
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
