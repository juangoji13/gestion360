import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL || 'cuentadeprueba@gmail.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Juanthek13';

test.describe('Validación de Motor Matemático y UI', () => {

    test.beforeEach(async ({ page }) => {
        // Ir a la raíz
        await page.goto('/');

        try {
            // Esperar explícitamente a que aparezca el email o falle en 3s si ya está logueado
            const emailInput = page.locator('input[type="email"]');
            await emailInput.waitFor({ state: 'visible', timeout: 4000 });
            
            // Llenar formulario y enviar
            await emailInput.fill(TEST_EMAIL);
            await page.fill('input[type="password"]', TEST_PASSWORD);
            await page.keyboard.press('Enter');
            
            // Dar tiempo a Supabase para resolver el JWT
            await page.waitForTimeout(4000);
        } catch (e) {
            // Si hay timeout, asumimos que ya estaba logueado o cargó el Dashboard
        }

        // Navegar a la pantalla objetivo
        await page.goto('/invoices/new');
        // Esperar a que el título característico cargue
        await page.waitForSelector('text=Crear Factura', { timeout: 10000 });
    });

    test('Suma Correcta de Ítems en el DOM (Regresión Matemática Nivel 1)', async ({ page }) => {
        // Presionar botón "Agregar Línea"
        const addBtn = page.getByRole('button', { name: /Agregar Línea/i });
        await expect(addBtn).toBeVisible();
        await addBtn.click();

        // En la fila creada, buscar el input de cantidad y establecerlo a 3
        const rowInputs = page.locator('tr').last().locator('input[type="number"]');
        await rowInputs.nth(0).fill('3');
        await rowInputs.nth(1).fill('10000'); // 10.000 precio unitario
        await rowInputs.nth(1).blur();

        // Verificar el Sidebar de Totales
        const subtotalDiv = page.locator('div:has-text("Subtotal")').last().locator('..');
        await expect(subtotalDiv).toContainText('30.000');
    });

    test('Aplicación Dinámica de IVA - 19% (Regresión Matemática Nivel 2)', async ({ page }) => {
        // Inyectamos 1 producto base de $100.000
        await page.getByRole('button', { name: /Agregar Línea/i }).click();
        const rowInputs = page.locator('tr').last().locator('input[type="number"]');
        await rowInputs.nth(0).fill('1'); 
        await rowInputs.nth(1).fill('100000'); // 100,000
        await rowInputs.nth(1).blur();

        // Activar Checkbox de Impuestos (IVA) en el TotalsSidebar (Segundo checkbox)
        await page.locator('input[type="checkbox"]').last().check({ force: true });

        // Tipear 19 en el input de tasa de impuesto (taxRate)
        const taxInput = page.getByPlaceholder('19');
        if (await taxInput.isVisible()) {
            await taxInput.fill('19');
            await taxInput.blur();
        }

        // Validar que el valor 119.000 aparezca explícitamente en el Total
        const totalDiv = page.locator('div:has-text("TOTAL:")').last().locator('..');
        await expect(totalDiv).toContainText('119.000');
    });
});
