/**
 * Módulo de Cálculos del ERP
 * Contiene funciones puras para garantizar la precisión contable.
 */

export const FinanceUtils = {
    /**
     * Calcula el subtotal de una lista de ítems.
     */
    calculateSubtotal: (items) => {
        return items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    },

    /**
     * Calcula el monto del impuesto (IVA).
     */
    calculateTax: (subtotal, taxRate) => {
        const rate = parseFloat(taxRate) || 0;
        return (subtotal * rate) / 100;
    },

    /**
     * Calcula el monto de un descuento.
     */
    calculateDiscount: (subtotal, discountValue, discountType = 'percentage') => {
        const val = parseFloat(discountValue) || 0;
        if (discountType === 'fixed') return val;
        return (subtotal * val) / 100;
    },

    /**
     * Calcula el total final de una factura.
     */
    calculateFinalTotal: (subtotal, taxAmount, discountAmount) => {
        return subtotal + (taxAmount || 0) - (discountAmount || 0);
    },

    /**
     * Calcula el saldo pendiente de una factura.
     */
    calculatePendingBalance: (total, amountPaid) => {
        const balance = (parseFloat(total) || 0) - (parseFloat(amountPaid) || 0);
        return Math.max(0, balance);
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
        return total - totalBaseCost - (parseFloat(taxAmount) || 0);
    }
};
