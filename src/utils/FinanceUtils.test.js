import { describe, it, expect } from 'vitest';
import { FinanceUtils } from './FinanceUtils';

describe('FinanceUtils', () => {
    describe('calculateSubtotal', () => {
        it('debe sumar correctamente los subtotales de los ítems', () => {
            const items = [
                { total: 100 },
                { total: '200' },
                { total: 0 }
            ];
            expect(FinanceUtils.calculateSubtotal(items)).toBe(300);
        });

        it('debe manejar ítems vacíos o nulos', () => {
            expect(FinanceUtils.calculateSubtotal([])).toBe(0);
        });
    });

    describe('calculateTax', () => {
        it('debe calcular el monto de IVA correctamente', () => {
            expect(FinanceUtils.calculateTax(100, 19)).toBe(19);
            expect(FinanceUtils.calculateTax(200, 10)).toBe(20);
        });

        it('debe manejar tasas de 0%', () => {
            expect(FinanceUtils.calculateTax(100, 0)).toBe(0);
        });
    });

    describe('calculateDiscount', () => {
        it('debe calcular descuento porcentual correctamente', () => {
            expect(FinanceUtils.calculateDiscount(100, 10, 'percentage')).toBe(10);
        });

        it('debe manejar descuento fijo correctamente', () => {
            expect(FinanceUtils.calculateDiscount(100, 25, 'fixed')).toBe(25);
        });
    });

    describe('calculateFinalTotal', () => {
        it('debe sumar subtotal + tax - discount', () => {
            expect(FinanceUtils.calculateFinalTotal(100, 19, 10)).toBe(109);
        });
    });

    describe('calculateNetProfit', () => {
        it('debe restar costos e impuestos del total', () => {
            const items = [
                { quantity: 2, purchase_price: 10 }, // costo 20
                { quantity: 1, purchase_price: 30 }  // costo 30
            ];
            const total = 100;
            const taxAmount = 10;
            // Profit: 100 - (20 + 30) - 10 = 40
            expect(FinanceUtils.calculateNetProfit(total, items, taxAmount)).toBe(40);
        });
    });
});
