import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

export function useStats() {
    const { business } = useAuth();
    const [stats, setStats] = useState({
        totalIncome: 0,
        netProfit: 0,
        inventoryInvestment: 0, // FIXED: Added missing initial key
        pendingInvoices: 0,
        paidInvoices: 0,
        chartData: {
            labels: ['-'],
            datasets: [{ data: [0] }, { data: [0] }]
        },
        loading: true,
        error: null
    });

    const fetchStats = useCallback(async (range = '7d') => {
        if (!business?.id) return;
        try {
            setStats(prev => ({ ...prev, loading: true }));

            // 1. Obtener todas las facturas y productos (Paridad Web + Inversión)
            const [invoicesRes, productsRes] = await Promise.all([
                supabase.from('invoices').select('*, invoice_items(*)').eq('business_id', business.id),
                supabase.from('products').select('*').eq('business_id', business.id)
            ]);

            if (invoicesRes.error) throw invoicesRes.error;
            if (productsRes.error) throw productsRes.error;

            const invoices = invoicesRes.data;
            const allProducts = productsRes.data;

            // 2. Calcular Inversión en Inventario (Costo Base * Stock)
            const inventoryInvestment = allProducts.reduce((sum, p) => {
                const stock = parseFloat(p.stock) || 0;
                const cost = parseFloat(p.base_price) || 0;
                return sum + (stock * cost);
            }, 0);

            // 3. Filtrar por rango
            const now = new Date();
            const filteredInvoices = invoices.filter(inv => {
                const d = new Date(inv.date || inv.created_at);
                if (range === 'today') {
                    return d.toLocaleDateString() === now.toLocaleDateString();
                }
                if (range === '7d') {
                    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7);
                    return d >= cutoff;
                }
                if (range === '30d') {
                    const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
                    return d >= cutoff;
                }
                return d.getFullYear() === now.getFullYear();
            });

            // 4. Calcular Totales (Lógica Precision Web)
            let totalIncome = 0;
            let totalPending = 0;
            let netProfit = 0;
            let pendingCount = 0;
            let paidCount = 0;

            filteredInvoices.forEach(inv => {
                const total = parseFloat(inv.total) || 0;
                const amountPaid = parseFloat(inv.amount_paid) || 0;
                
                // Lógica unificada con Web: 
                // Si está pagada, usamos el total. Si no, lo que realmente se ha abonado.
                const realPaid = inv.status === 'paid' ? Math.max(total, amountPaid) : amountPaid;
                const pending = Math.max(0, total - realPaid);

                totalIncome += realPaid;
                totalPending += pending;

                if (inv.status === 'paid') paidCount++;
                else if (inv.status === 'pending') pendingCount++;

                const totalBaseCost = (inv.invoice_items || []).reduce((sum, item) => {
                    const cost = parseFloat(item.purchase_price) || 0;
                    return sum + (cost * (parseFloat(item.quantity) || 0));
                }, 0);

                const tax = parseFloat(inv.tax_amount) || 0;
                
                // La ganancia neta también se calcula sobre lo cobrado
                const paidRatio = total > 0 ? (realPaid / total) : 0;
                const estimatedProfit = (total - totalBaseCost - tax) * paidRatio;
                
                netProfit += estimatedProfit;
            });

            // 5. Preparar Gráfica (Buckets de Barras)
            let labels = [];
            let incomeBuckets = [];
            let profitBuckets = [];

            if (range === 'today') {
                const hours = Array.from({ length: 6 }, (_, i) => {
                    const h = (new Date().getHours() - (5 - i) + 24) % 24;
                    return `${h}:00`;
                });
                labels = hours;
                const dailyBuckets = hours.map(() => ({ inc: 0, pro: 0 }));
                
                filteredInvoices.forEach(inv => {
                    const h = new Date(inv.created_at).getHours();
                    const hourLabel = `${h}:00`;
                    const idx = hours.indexOf(hourLabel);
                    if (idx !== -1) {
                        const total = parseFloat(inv.total) || 0;
                        const amountPaid = parseFloat(inv.amount_paid) || 0;
                        const realPaid = inv.status === 'paid' ? Math.max(total, amountPaid) : amountPaid;
                        
                        const cost = (inv.invoice_items || []).reduce((s, it) => s + (parseFloat(it.purchase_price) || 0) * (parseFloat(it.quantity) || 0), 0);
                        const tax = parseFloat(inv.tax_amount) || 0;
                        
                        const paidRatio = total > 0 ? (realPaid / total) : 0;
                        const estimatedProfit = (total - cost - tax) * paidRatio;

                        dailyBuckets[idx].inc += realPaid;
                        dailyBuckets[idx].pro += estimatedProfit;
                    }
                });
                incomeBuckets = dailyBuckets.map(b => b.inc);
                profitBuckets = dailyBuckets.map(b => b.pro);
            } else {
                const daysMap = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const timeframe = range === '7d' ? 7 : (range === '30d' ? 6 : 12);
                const dBuckets = Array.from({ length: timeframe }, (_, i) => {
                    const d = new Date(now);
                    if (range === '7d') d.setDate(d.getDate() - (timeframe - 1 - i));
                    else if (range === '30d') d.setDate(d.getDate() - (5 * (timeframe - 1 - i)));
                    else d.setMonth(d.getMonth() - (timeframe - 1 - i));

                    return { 
                        date: d.toLocaleDateString(), 
                        label: range === '7d' ? daysMap[d.getDay()] : (range === '30d' ? `${d.getDate()}/${d.getMonth()+1}` : d.toLocaleString('default', { month: 'short' })),
                        inc: 0, 
                        pro: 0 
                    };
                });

                filteredInvoices.forEach(inv => {
                    const invDate = new Date(inv.date || inv.created_at);
                    const dStr = invDate.toLocaleDateString();
                    let b = dBuckets.find(bucket => bucket.date === dStr);
                    if (!b && range !== '7d') {
                        b = dBuckets[dBuckets.length - 1];
                    }
                    if (b) {
                        const total = parseFloat(inv.total) || 0;
                        const amountPaid = parseFloat(inv.amount_paid) || 0;
                        const realPaid = inv.status === 'paid' ? Math.max(total, amountPaid) : amountPaid;
                        
                        const cost = (inv.invoice_items || []).reduce((s, it) => s + (parseFloat(it.purchase_price) || 0) * (parseFloat(it.quantity) || 0), 0);
                        const tax = parseFloat(inv.tax_amount) || 0;
                        
                        const paidRatio = total > 0 ? (realPaid / total) : 0;
                        const estimatedProfit = (total - cost - tax) * paidRatio;

                        b.inc += realPaid;
                        b.pro += estimatedProfit;
                    }
                });
                labels = dBuckets.map(b => b.label);
                incomeBuckets = dBuckets.map(b => b.inc);
                profitBuckets = dBuckets.map(b => b.pro);
            }

            setStats({
                totalIncome: totalIncome,
                totalPending: totalPending,
                netProfit: netProfit,
                inventoryInvestment: inventoryInvestment,
                pendingCount: pendingCount,
                paidCount: paidCount,
                chartData: {
                    labels: labels.length > 0 ? labels : ['-'],
                    datasets: [
                        { data: incomeBuckets.length > 0 ? incomeBuckets : [0] },
                        { data: profitBuckets.length > 0 ? profitBuckets : [0] }
                    ],
                    legend: ["Ventas (Cobros)", "Ganancias (Reales)"]
                },
                loading: false,
                error: null
            });
        } catch (err) {
            setStats(prev => ({ ...prev, loading: false, error: err.message }));
        }
    }, [business?.id]);


    return { ...stats, refresh: fetchStats };
}
