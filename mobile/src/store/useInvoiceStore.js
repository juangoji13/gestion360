import { create } from 'zustand'

const EPSILON = Number.EPSILON || 2.220446049250313e-16;
const round2 = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 0;
    return Math.round((num + EPSILON) * 100) / 100;
};

export const useInvoiceStore = create((set, get) => ({
    // Form State
    selectedClient: null,
    invoiceNumber: '',
    items: [],
    applyIVA: false,
    ivaPercent: '19',
    applyDiscount: false,
    discountType: 'fixed',
    discountValue: '0',
    initialPayment: '0',
    notes: '',

    setField: (field, value) => set({ [field]: value }),

    addItem: (product) => set((state) => {
        const existing = state.items.find(it => it.product_id === product.id);
        if (existing) {
            return {
                items: state.items.map(it => 
                    it.product_id === product.id 
                    ? { ...it, quantity: it.quantity + 1, total: Math.round(it.price * (it.quantity + 1)) } 
                    : it
                )
            };
        } else {
            return {
                items: [...state.items, {
                    product_id: product.id,
                    name: product.name,
                    price: product.sale_price,
                    purchase_price: product.base_price || 0,
                    quantity: 1,
                    total: product.sale_price,
                    sku: product.sku || 'N/A'
                }]
            };
        }
    }),

    updateItemQuantity: (index, deltaOrValue) => set((state) => {
        const next = [...state.items];
        let newQty;
        if (typeof deltaOrValue === 'string') {
            newQty = parseInt(deltaOrValue.replace(/[^0-9]/g, '')) || 0;
        } else {
            newQty = Math.max(0, next[index].quantity + deltaOrValue);
        }
        next[index] = { ...next[index], quantity: newQty, total: Math.round(next[index].price * newQty) };
        return { items: next };
    }),

    updateItemPrice: (index, priceText) => set((state) => {
        const cleanVal = priceText.replace(/[^\d]/g, '');
        const newPrice = parseFloat(cleanVal) || 0;
        const next = [...state.items];
        next[index] = { 
            ...next[index], 
            price: newPrice, 
            total: Math.round(newPrice * next[index].quantity) 
        };
        return { items: next };
    }),

    removeItem: (index) => set((state) => ({
        items: state.items.filter((_, i) => i !== index)
    })),

    resetStore: () => set({
        selectedClient: null,
        items: [],
        applyIVA: false,
        ivaPercent: '19',
        applyDiscount: false,
        discountType: 'fixed',
        discountValue: '0',
        initialPayment: '0',
        notes: '',
    }),

    getTotals: () => {
        const { items, applyDiscount, discountType, discountValue, applyIVA, ivaPercent } = get();
        const subtotal = round2(items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseFloat(item.quantity) || 0)), 0));
        
        const rawDiscount = parseFloat(discountValue) || 0;
        const discount = applyDiscount 
            ? (discountType === 'percent' ? round2(subtotal * (rawDiscount / 100)) : round2(rawDiscount))
            : 0;
    
        const subtotalAfterDiscount = Math.max(0, round2(subtotal - discount));
        const iva = applyIVA ? round2(subtotalAfterDiscount * (parseFloat(ivaPercent) / 100 || 0)) : 0;
        const total = round2(subtotalAfterDiscount + iva);
        
        return { subtotal, discount, iva, total };
    }
}))
