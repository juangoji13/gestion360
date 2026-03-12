import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export function useProducts() {
    const { business } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [topProducts, setTopProducts] = useState([]);

    async function fetchProducts() {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('products')
                .select('*')
                .eq('business_id', business?.id)
                .order('name');

            if (fetchError) throw fetchError;
            setProducts(data);
            
            // Fetch Top Selling Products (simplified aggregation)
            const { data: salesData, error: salesError } = await supabase
                .from('invoice_items')
                .select('product_name, quantity, total')
                .limit(200); // Get recent items to approximate top sales

            if (!salesError && salesData) {
                const aggregated = salesData.reduce((acc, item) => {
                    const name = item.product_name;
                    if (!acc[name]) acc[name] = { name, quantity: 0, total: 0 };
                    acc[name].quantity += (parseFloat(item.quantity) || 0);
                    acc[name].total += (parseFloat(item.total) || 0);
                    return acc;
                }, {});
                
                const top = Object.values(aggregated)
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 5);
                setTopProducts(top);
            }

            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function createProduct(productData) {
        const { data, error } = await supabase
            .from('products')
            .insert([{ ...productData, business_id: business.id }])
            .select();
        if (!error) fetchProducts();
        return { data, error };
    }

    async function updateProduct(id, productData) {
        const { data, error } = await supabase
            .from('products')
            .update(productData)
            .eq('id', id)
            .select();
        if (!error) fetchProducts();
        return { data, error };
    }

    async function deleteProduct(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (!error) fetchProducts();
        return { error };
    }

    useEffect(() => {
        if (business?.id) fetchProducts();
    }, [business?.id]);

    const lowStockCount = products.filter(p => p.track_stock && (parseFloat(p.stock) || 0) <= 5).length;
    
    // Calcular métricas considerando unidades reservadas para productos sin stock
    const metrics = products.reduce((acc, p) => {
        const physicalStock = parseFloat(p.stock) || 0;
        
        // Buscamos cuántas unidades están reservadas para este producto
        // topProducts ya tiene el conteo de quantity de los invoice_items recientes
        // Nota: Para mayor precisión en una app real, traeríamos todos los items de facturas pendientes
        const reservedItem = topProducts.find(tp => tp.name === p.name);
        const reservedQty = p.track_stock ? 0 : (reservedItem?.quantity || 0);
        
        const effectiveQty = physicalStock + reservedQty;
        const cost = parseFloat(p.base_price) || 0;
        const price = parseFloat(p.sale_price) || 0;
        
        acc.investment += (cost * effectiveQty);
        acc.salesValue += (price * effectiveQty);
        return acc;
    }, { investment: 0, salesValue: 0 });

    const totalInvestment = metrics.investment;
    const totalSalesValue = metrics.salesValue;
    const totalProfit = totalSalesValue - totalInvestment;
    const marginPercent = totalSalesValue > 0 ? (totalProfit / totalSalesValue) * 100 : 0;

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
