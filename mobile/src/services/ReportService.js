import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export const ReportService = {
    async generateProductReport(business, products, invoices, period = null) {
        try {
            // Análisis de ventas por producto (MISMA LÓGICA QUE EN WEB)
            const productStats = products.map(p => {
                let soldQty = 0;
                let reservedQty = 0;
                let grossProfit = 0;

                invoices.forEach(inv => {
                    const items = inv.invoice_items || [];
                    items.forEach(it => {
                        // Buscamos coincidencia por ID o Nombre (para robustez)
                        if (it.product_id === p.id || it.product_name === p.name) {
                            const qty = parseFloat(it.quantity) || 0;
                            
                            if (inv.status === 'paid') {
                                soldQty += qty;
                            } else if (inv.status === 'pending' || inv.status === 'overdue') {
                                reservedQty += qty;
                            }

                            const lineTotal = parseFloat(it.total) || 0;
                            const baseCost = (parseFloat(p.base_price) || 0) * qty;
                            grossProfit += (lineTotal - baseCost);
                        }
                    });
                });

                return {
                    name: p.name,
                    sku: p.sku || 'N/A',
                    stock: p.stock || 0,
                    basePrice: parseFloat(p.base_price) || 0,
                    salePrice: parseFloat(p.sale_price) || 0,
                    soldQty,
                    reservedQty,
                    grossProfit
                };
            });

            const html = `
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body { font-family: 'Helvetica', sans-serif; padding: 20px; color: #1e293b; }
                        .header { border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
                        .title { font-size: 24px; font-weight: 900; color: #1d4ed8; margin: 0; }
                        .business-name { font-size: 14px; color: #64748b; font-weight: 600; margin-top: 5px; }
                        .meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }
                        
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #3b82f6; color: white; text-align: left; padding: 10px 5px; font-size: 10px; text-transform: uppercase; }
                        td { padding: 10px 5px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .highlight { font-weight: bold; color: #1e293b; }
                        .reserved { color: #f59e0b; font-weight: bold; }
                        .profit { color: #10b981; font-weight: bold; }
                        
                        .footer { margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 10px; color: #94a3b8; font-style: italic; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 class="title">Reporte de Inventario y Ventas</h1>
                        <div class="business-name">${business?.name || 'Gestión360'}</div>
                        <div class="meta">
                            ${period ? `Periodo: ${period.from} al ${period.to}` : ''} | 
                            Generado: ${new Date().toLocaleDateString('es-ES')}
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th class="text-center">Stock</th>
                                <th class="text-right">Venta</th>
                                <th class="text-center">Vend.</th>
                                <th class="text-center">Reser.</th>
                                <th class="text-right">Utilidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productStats.map(p => `
                                <tr>
                                    <td class="highlight">${p.name}<br/><small style="color:#94a3b8">${p.sku}</small></td>
                                    <td class="text-center">${p.stock}</td>
                                    <td class="text-right">$ ${p.salePrice.toLocaleString()}</td>
                                    <td class="text-center">${p.soldQty}</td>
                                    <td class="text-center reserved">${p.reservedQty}</td>
                                    <td class="text-right profit">$ ${p.grossProfit.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        Este documento es un resumen informativo del desempeño de inventario y reservas de ventas. 
                        Generado automáticamente por Gestión360 ERP.
                    </div>
                </body>
                </html>
            `;

            const { uri } = await Print.printToFileAsync({ html });
            
            const now = new Date();
            const dateStr = `${now.getDate()}-${now.getMonth() + 1}`;
            const fileName = `Reporte_Inventario_${dateStr}.pdf`;
            const newUri = `${FileSystem.cacheDirectory}${fileName}`;
            
            await FileSystem.moveAsync({
                from: uri,
                to: newUri
            });

            await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
            return true;
        } catch (error) {
            console.error('Error generating report:', error);
            return false;
        }
    }
};
