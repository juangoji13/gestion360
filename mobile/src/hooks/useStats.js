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
            const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            
            // Generar los últimos 7 días con etiquetas y 0s por defecto
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().split('T')[0];
                
                // Buscar si hay data para ese día en el resultado de la RPC
                const dayData = dailyStats.find(s => s.date === dateStr);
                
                return {
                    label: daysMap[d.getDay()],
                    income: dayData ? parseFloat(dayData.income) : 0,
                    profit: dayData ? parseFloat(dayData.profit) : 0
                };
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
