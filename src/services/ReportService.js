import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatDate } from '../utils/formatters'

export const ReportService = {
    generatePaymentReport(business, invoices, period = null) {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // Encabezado
        doc.setFontSize(22)
        doc.setTextColor(26, 86, 219)
        doc.text('Reporte de Pagos / Estado de Caja', 14, 22)

        doc.setFontSize(11)
        doc.setTextColor(60)
        doc.text(business?.name || 'Mi Negocio', 14, 30)
        if (period) {
            doc.text(`Periodo: ${period.from} al ${period.to}`, 14, 35)
            doc.text(`Fecha de emisión: ${formatDate(new Date())}`, 14, 40)
        } else {
            doc.text(`Fecha de emisión: ${formatDate(new Date())}`, 14, 35)
        }

        // Resumen Financiero
        const totalPaid = invoices.reduce((sum, inv) => {
            const total = parseFloat(inv.total) || 0;
            const paid = parseFloat(inv.amount_paid) || 0;
            return sum + (inv.status === 'paid' ? Math.max(total, paid) : paid);
        }, 0)

        const totalPending = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, inv) => {
            const total = parseFloat(inv.total) || 0;
            const paid = parseFloat(inv.amount_paid) || 0;
            const actualPaid = inv.status === 'paid' ? Math.max(total, paid) : paid;
            return sum + Math.max(0, total - actualPaid);
        }, 0)

        doc.setDrawColor(226, 232, 240)
        doc.setFillColor(248, 250, 252)
        doc.roundedRect(14, 50, (pageWidth - 42) / 2, 30, 3, 3, 'FD')
        doc.roundedRect(pageWidth / 2 + 7, 50, (pageWidth - 42) / 2, 30, 3, 3, 'FD')

        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text('TOTAL COBRADO (PAGADAS)', 20, 60)
        doc.text('TOTAL PENDIENTE (POR COBRAR)', pageWidth / 2 + 13, 60)

        doc.setFontSize(16)
        doc.setTextColor(16, 185, 129) // Éxito (Verde)
        doc.text(formatCurrency(totalPaid), 20, 72)
        doc.setTextColor(245, 158, 11) // Alerta (Ámbar)
        doc.text(formatCurrency(totalPending), pageWidth / 2 + 13, 72)

        // Agrupar por Cliente
        const clientSummary = {}
        invoices.forEach(inv => {
            const clientName = inv.client?.name || 'Cliente Genérico'
            // Usamos name o id como clave de agrupación
            const groupKey = inv.client?.id || clientName

            if (!clientSummary[groupKey]) {
                clientSummary[groupKey] = {
                    name: clientName,
                    documentId: inv.client?.document_id || 'N/A',
                    totalInvoiced: 0,
                    totalPaid: 0,
                    totalOpen: 0,
                    totalOverdue: 0
                }
            }

            const total = parseFloat(inv.total) || 0
            const amountPaid = parseFloat(inv.amount_paid) || 0

            // Si la factura está pagada pero no tiene amount_paid, asumimos que se pagó el 100% (retrocompatibilidad)
            const actualPaid = inv.status === 'paid' ? Math.max(total, amountPaid) : amountPaid
            const pending = Math.max(0, total - actualPaid)

            clientSummary[groupKey].totalInvoiced += total
            clientSummary[groupKey].totalPaid += actualPaid

            if (inv.status === 'overdue') {
                clientSummary[groupKey].totalOverdue += pending
                clientSummary[groupKey].totalOpen += pending
            } else if (inv.status === 'pending') {
                clientSummary[groupKey].totalOpen += pending
            }
        })

        const tableBody = Object.values(clientSummary).map(c => [
            c.documentId,
            c.name,
            formatCurrency(c.totalInvoiced),
            formatCurrency(c.totalPaid),
            formatCurrency(c.totalOpen),
            formatCurrency(c.totalOverdue)
        ])

        const totalInvoicedAll = Object.values(clientSummary).reduce((sum, c) => sum + c.totalInvoiced, 0)
        const totalPaidAll = Object.values(clientSummary).reduce((sum, c) => sum + c.totalPaid, 0)
        const totalOpenAll = Object.values(clientSummary).reduce((sum, c) => sum + c.totalOpen, 0)
        const totalOverdueAll = Object.values(clientSummary).reduce((sum, c) => sum + c.totalOverdue, 0)

        autoTable(doc, {
            startY: 90,
            head: [['Doc. Cliente', 'Cliente', 'Monto Facturado', 'Pagos', 'Monto Abierto', 'Monto Vencido']],
            body: tableBody,
            foot: [['', 'TOTALES', formatCurrency(totalInvoicedAll), formatCurrency(totalPaidAll), formatCurrency(totalOpenAll), formatCurrency(totalOverdueAll)]],
            headStyles: { fillColor: [26, 86, 219], textColor: [255, 255, 255] },
            footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { top: 90 },
            styles: { fontSize: 8 },
        })

        // Pie de página
        const finalY = doc.lastAutoTable.finalY + 15
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('Documento generado automáticamente por Gestión360 ERP.', 14, finalY)

        doc.save(`Reporte_Pagos_${new Date().toISOString().split('T')[0]}.pdf`)
    },

    generateProductReport(business, products, invoices, period = null) {
        const doc = new jsPDF()

        // Encabezado
        doc.setFontSize(22)
        doc.setTextColor(26, 86, 219)
        doc.text('Reporte de Artículos e Inventario', 14, 22)

        doc.setFontSize(11)
        doc.setTextColor(60)
        doc.text(business?.name || 'Mi Negocio', 14, 30)
        if (period) {
            doc.text(`Periodo: ${period.from} al ${period.to}`, 14, 35)
            doc.text(`Fecha del informe: ${formatDate(new Date())}`, 14, 40)
        } else {
            doc.text(`Fecha del informe: ${formatDate(new Date())}`, 14, 35)
        }

        // Análisis de ventas por producto
        const productStats = products.map(p => {
            let totalQty = 0
            let grossProfit = 0

            invoices.forEach(inv => {
                const items = inv.invoice_items || []
                items.forEach(it => {
                    if (it.product_id === p.id) {
                        const qty = parseFloat(it.quantity) || 0
                        totalQty += qty

                        const lineTotal = parseFloat(it.total) || 0
                        const baseCost = (parseFloat(p.base_price) || 0) * qty

                        // La ganancia bruta general de este ítem (Precio de Venta - Precio Contable Base)
                        grossProfit += (lineTotal - baseCost)
                    }
                })
            })

            const basePrice = parseFloat(p.base_price) || 0
            const salePrice = parseFloat(p.sale_price) || 0
            return [
                p.name,
                p.sku || 'N/A',
                p.stock || 0,
                formatCurrency(basePrice),
                formatCurrency(salePrice),
                totalQty,
                formatCurrency(grossProfit)
            ]
        })

        autoTable(doc, {
            startY: 50,
            head: [['Nombre Artículo', 'SKU', 'Stock', 'Precio Base', 'Precio Venta', 'Ud. Vendidas', 'Ganancia Bruta']],
            body: productStats,
            headStyles: { fillColor: [26, 86, 219], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            alternateRowStyles: { fillColor: [250, 250, 250] },
        })

        const finalY = doc.lastAutoTable.finalY + 15
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('Control de Inventario y Desempeño Comercial. Prohibida su reproducción sin autorización.', 14, finalY)

        doc.save(`Reporte_Articulos_${new Date().toISOString().split('T')[0]}.pdf`)
    }
}
