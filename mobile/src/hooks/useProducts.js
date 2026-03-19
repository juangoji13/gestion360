import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const round2 = (val) => Math.round((val + Number.EPSILON) * 100) / 100;

export function useProducts() {
    const { business } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [topProducts, setTopProducts] = useState([]);

    const fetchProducts = useCallback(async () => {
        if (!business?.id) return;
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('products')
                .select('*')
                .eq('business_id', business?.id)
                .order('name');

            if (fetchError) throw fetchError;
            
            // Traer todas las facturas recientes para calcular ventas y reservas
            const { data: invoicesData, error: invError } = await supabase
                .from('invoices')
                .select('status, invoice_items(*)')
                .eq('business_id', business?.id);

            if (invError) throw invError;

            // Procesar productos con sus métricas dinámicas
            const processedProducts = data.map(p => {
                let soldQty = 0;
                let reservedQty = 0;

                invoicesData?.forEach(inv => {
                    inv.invoice_items?.forEach(it => {
                        if (it.product_id === p.id || it.product_name === p.name) {
                            const qty = parseFloat(it.quantity) || 0;
                            if (inv.status === 'paid') {
                                soldQty += qty;
                            } else if (inv.status === 'pending' || inv.status === 'overdue') {
                                reservedQty += qty;
                            }
                        }
                    });
                });

                return { ...p, soldQty, reservedQty };
            });

            setProducts(processedProducts);
            
            // Calculate Top Selling Products from processed data
            const top = [...processedProducts]
                .sort((a, b) => b.soldQty - a.soldQty)
                .slice(0, 5)
                .map(p => ({ name: p.name, quantity: p.soldQty, total: p.soldQty * (parseFloat(p.sale_price) || 0) }));
            
            setTopProducts(top);

            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [business?.id]);

    async function createProduct(productData) {
        const sanitizedData = Object.fromEntries(
            Object.entries(productData).map(([key, value]) => [
                key, 
                typeof value === 'string' && value.trim() === '' ? null : value
            ])
        );

        const { data, error } = await supabase
            .from('products')
            .insert([{ ...sanitizedData, business_id: business.id }])
            .select();
        
        return { data, error };
    }

    async function updateProduct(id, productData) {
        const sanitizedData = Object.fromEntries(
            Object.entries(productData).map(([key, value]) => [
                key, 
                typeof value === 'string' && value.trim() === '' ? null : value
            ])
        );

        const { data, error } = await supabase
            .from('products')
            .update(sanitizedData)
            .eq('id', id)
            .select();
        
        return { data, error };
    }

    async function deleteProduct(id) {
        setProducts(prev => prev.filter(p => p.id !== id));
        
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        
        if (error) fetchProducts();
        
        return { error };
    }

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [fetchProducts])
    );

    const lowStockCount = products.filter(p => p.track_stock && (parseFloat(p.stock) || 0) <= 5).length;
    
    // Métricas globales calculadas sobre los productos procesados
    const metrics = products.reduce((acc, p) => {
        const physicalStock = parseFloat(p.stock) || 0;
        const cost = parseFloat(p.base_price) || 0;
        const price = parseFloat(p.sale_price) || 0;
        
        // Lógica de Reconocimiento de Flexibles / Servicios:
        // Si no trackea stock o tiene stock 0 pero tiene ventas (soldQty > 0 o reservedQty > 0), 
        // Si no trackea stock o tiene stock 0 pero tiene ventas
        const sold = p.soldQty || 0;
        const reserved = p.reservedQty || 0;
        if (!p.track_stock || physicalStock === 0) {
            acc.investment += (cost * (sold + reserved));
            acc.salesValue += (price * (sold + reserved));
        } else {
            acc.investment += (cost * physicalStock);
            acc.salesValue += (price * physicalStock);
        }
        return acc;
    }, { investment: 0, salesValue: 0 });

    const totalInvestment = round2(metrics.investment);
    const totalSalesValue = round2(metrics.salesValue);
    const totalProfit = round2(totalSalesValue - totalInvestment);
    const marginPercent = totalSalesValue > 0 ? round2((totalProfit / totalSalesValue) * 100) : 0;

    return { 
        products, 
        topProducts,
        loading, 
        error, 
        lowStockCount, 
        totalInvestment, 
        totalSalesValue,
        totalProfit,
        marginPercent,
        refresh: fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct
    };
}
