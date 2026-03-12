/**
 * Módulo de Cálculos del ERP
 * Contiene funciones puras para garantizar la precisión contable.
 */

export const FinanceUtils = {
    /**
     * Redondeo financiero estándar a 2 decimales.
     */
    round: (val) => {
        return Math.round((val + Number.EPSILON) * 100) / 100;
    },

    /**
     * Calcula el subtotal de una lista de ítems.
     */
    calculateSubtotal: (items) => {
        const total = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
        return FinanceUtils.round(total);
    },

    /**
     * Calcula el monto del impuesto (IVA).
     */
    calculateTax: (subtotal, taxRate) => {
        const rate = parseFloat(taxRate) || 0;
        return FinanceUtils.round((subtotal * rate) / 100);
    },

    /**
     * Calcula el monto de un descuento.
     */
    calculateDiscount: (subtotal, discountValue, discountType = 'percentage') => {
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'fixed') return FinanceUtils.round(val);
        return FinanceUtils.round((subtotal * val) / 100);
    },

    /**
     * Calcula el total final de una factura.
     */
    calculateFinalTotal: (subtotal, taxAmount, discountAmount) => {
        return FinanceUtils.round(subtotal + (taxAmount || 0) - (discountAmount || 0));
    },

    /**
     * Calcula el saldo pendiente de una factura.
     */
    calculatePendingBalance: (total, amountPaid) => {
        const balance = (parseFloat(total) || 0) - (parseFloat(amountPaid) || 0);
        return Math.max(0, FinanceUtils.round(balance));
    },

    /**
     * Calcula la ganancia neta de una factura basada en costos históricos.
     */
    calculateNetProfit: (total, items, taxAmount) => {
        const totalBaseCost = items.reduce((sum, item) => {
            const purchasePrice = parseFloat(item.purchase_price) || 0;
            const quantity = parseFloat(item.quantity) || 0;
            return sum + (purchasePrice * quantity);
        }, 0);

        // La ganancia es Total - Costos - Impuestos (asumiendo que impuestos no son ganancia)
        return FinanceUtils.round(total - totalBaseCost - (parseFloat(taxAmount) || 0));
    }
};
