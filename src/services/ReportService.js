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

        const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => {
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
                    totalOpen: 0
                }
            }

            const total = parseFloat(inv.total) || 0
            const amountPaid = parseFloat(inv.amount_paid) || 0

            // Si la factura está pagada pero no tiene amount_paid, asumimos que se pagó el 100% (retrocompatibilidad)
            const actualPaid = inv.status === 'paid' ? Math.max(total, amountPaid) : amountPaid
            const pending = Math.max(0, total - actualPaid)

            clientSummary[groupKey].totalInvoiced += total
            clientSummary[groupKey].totalPaid += actualPaid

            if (inv.status === 'pending') {
                clientSummary[groupKey].totalOpen += pending
            }
        })

        const tableBody = Object.values(clientSummary).map(c => [
            c.documentId,
            c.name,
            formatCurrency(c.totalInvoiced),
            formatCurrency(c.totalPaid),
            formatCurrency(c.totalOpen)
        ])

        const totalInvoicedAll = Object.values(clientSummary).reduce((sum, c) => sum + c.totalInvoiced, 0)
        const totalPaidAll = Object.values(clientSummary).reduce((sum, c) => sum + c.totalPaid, 0)
        const totalOpenAll = Object.values(clientSummary).reduce((sum, c) => sum + c.totalOpen, 0)

        autoTable(doc, {
            startY: 90,
            head: [['Doc. Cliente', 'Cliente', 'Monto Facturado', 'Pagos', 'Monto Abierto']],
            body: tableBody,
            foot: [['', 'TOTALES', formatCurrency(totalInvoicedAll), formatCurrency(totalPaidAll), formatCurrency(totalOpenAll)]],
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
            let soldQty = 0
            let reservedQty = 0
            let grossProfit = 0

            invoices.forEach(inv => {
                const items = inv.invoice_items || []
                items.forEach(it => {
                    if (it.product_id === p.id) {
                        const qty = parseFloat(it.quantity) || 0
                        
                        if (inv.status === 'paid') {
                            soldQty += qty
                        } else if (inv.status === 'pending') {
                            reservedQty += qty
                        }

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
                soldQty,
                reservedQty,
                formatCurrency(grossProfit)
            ]
        })

        autoTable(doc, {
            startY: 50,
            head: [['Nombre Artículo', 'SKU', 'Stock', 'Precio Base', 'Precio Venta', 'Ud. Vend.', 'Ud. Reser.', 'Ganancia Bruta']],
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
    },

    generateClientReport(business, client, invoices) {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // Encabezado
        doc.setFontSize(22)
        doc.setTextColor(26, 86, 219)
        doc.text('Estado de Cuenta de Cliente', 14, 22)

        doc.setFontSize(11)
        doc.setTextColor(60)
        doc.text(business?.name || 'Mi Negocio', 14, 30)
        doc.text(`Fecha de emisión: ${formatDate(new Date())}`, 14, 35)

        // Perfil del Cliente
        doc.setDrawColor(226, 232, 240)
        doc.line(14, 45, pageWidth - 14, 45)

        doc.setFontSize(12)
        doc.setTextColor(30)
        doc.text('INFORMACIÓN DEL CLIENTE', 14, 55)
        
        doc.setFontSize(10)
        doc.setTextColor(60)
        doc.text(`Nombre: ${client.name}`, 14, 65)
        doc.text(`Identificación: ${client.document_id || 'N/A'}`, 14, 71)
        doc.text(`Teléfono: ${client.phone || 'N/A'}`, 14, 77)
        doc.text(`Dirección: ${client.address || 'N/A'}`, 14, 83)

        // Resumen Financiero
        const clientInvoices = invoices.filter(inv => inv.client_id === client.id)
        const totalInvoiced = clientInvoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0)
        const totalPaid = clientInvoices.reduce((sum, inv) => {
            const total = parseFloat(inv.total) || 0
            const paid = parseFloat(inv.amount_paid) || 0
            return sum + (inv.status === 'paid' ? Math.max(total, paid) : paid)
        }, 0)
        const pendingBalance = Math.max(0, totalInvoiced - totalPaid)

        doc.setFillColor(248, 250, 252)
        doc.roundedRect(pageWidth - 80, 55, 66, 32, 2, 2, 'F')
        
        doc.setFontSize(9)
        doc.setTextColor(100)
        doc.text('RESUMEN DE CUENTA', pageWidth - 74, 63)
        
        doc.setFontSize(10)
        doc.setTextColor(30)
        doc.text(`Total Compras:`, pageWidth - 74, 72)
        doc.text(`${formatCurrency(totalInvoiced)}`, pageWidth - 20, 72, { align: 'right' })
        
        doc.setTextColor(16, 185, 129) // Verde
        doc.text(`Total Pagado:`, pageWidth - 74, 78)
        doc.text(`${formatCurrency(totalPaid)}`, pageWidth - 20, 78, { align: 'right' })
        
        doc.setFontSize(11)
        doc.setTextColor(220, 38, 38) // Rojo
        doc.text(`Saldo Pendiente:`, pageWidth - 74, 85)
        doc.text(`${formatCurrency(pendingBalance)}`, pageWidth - 20, 85, { align: 'right' })

        // Tabla de Actividad
        const tableBody = clientInvoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(inv => [
            inv.invoice_number,
            formatDate(inv.date || inv.created_at),
            inv.status.toUpperCase(),
            formatCurrency(inv.total),
            formatCurrency(inv.status === 'paid' ? inv.total : (inv.amount_paid || 0)),
            formatCurrency(Math.max(0, inv.total - (inv.status === 'paid' ? inv.total : (inv.amount_paid || 0))))
        ])

        autoTable(doc, {
            startY: 95,
            head: [['Nº Factura', 'Fecha', 'Estado', 'Monto Total', 'Monto Pagado', 'Pendiente']],
            body: tableBody,
            headStyles: { fillColor: [26, 86, 219], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            styles: { fontSize: 8 },
        })

        // Pie de página
        const finalY = doc.lastAutoTable.finalY + 15
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text('Historial Detallado de Cliente. Documento generado por Gestión360 ERP.', 14, finalY)

        doc.save(`Estado_Cuenta_${client.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    }
}
