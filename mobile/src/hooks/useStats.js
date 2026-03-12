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

            const { data, error } = await supabase.rpc('get_dashboard_stats_v2', {
                p_business_id: business.id,
                p_start_date: startDate,
                p_end_date: endDate
            });

            if (error) throw error;

            setStats({
                totalIncome: data.totalRevenue || 0,
                netProfit: data.netProfit || 0,
                pendingInvoices: data.pendingCount || 0,
                paidInvoices: data.paidCount || 0,
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
