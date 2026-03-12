import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { Download, FileText, Send, Share2 } from 'lucide-react'
import './InvoiceTemplate.css'

export default function InvoiceTemplate({ 
    business, client, invoiceNumber, invoiceDate, items, 
    subtotal, taxRate, taxAmount, discountAmount, total, 
    notes, onImageGenerated, dueDate, isPaid 
}) {
    const templateRef = useRef(null)

    const generateImage = async () => {
        if (!templateRef.current) return null
        try {
            const dataUrl = await toPng(templateRef.current, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
            })
            return dataUrl
        } catch (err) {
            console.error('Error generating image:', err)
            return null
        }
    }

    const generatePDF = () => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        })

        const margin = 20
        let y = margin

        // Header
        doc.setFontSize(22)
        doc.setTextColor(30, 58, 138) // it-company-name color
        doc.text(business?.name || 'Mi Empresa', margin, y)
        y += 8

        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        if (business?.email) { doc.text(`✉️ ${business.email}`, margin, y); y += 5; }
        if (business?.phone) { doc.text(`📞 ${business.phone}`, margin, y); y += 5; }
        if (business?.address) { doc.text(`📍 ${business.address}`, margin, y); y += 5; }
        if (business?.tax_id) { doc.text(`🏛️ NIT: ${business.tax_id}`, margin, y); y += 5; }

        // Meta (Right Side)
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(14)
        doc.text('FACTURA', 150, margin, { align: 'right' })
        doc.setFontSize(12)
        doc.text(`N°: ${invoiceNumber}`, 150, margin + 8, { align: 'right' })
        doc.text(`Fecha: ${formatDate(invoiceDate)}`, 150, margin + 14, { align: 'right' })

        y = Math.max(y, margin + 30)
        doc.setDrawColor(226, 232, 240)
        doc.line(margin, y, 190, y)
        y += 10

        // Client Info
        doc.setFontSize(10)
        doc.setTextColor(148, 163, 184)
        doc.text('FACTURAR A', margin, y)
        y += 6
        doc.setFontSize(13)
        doc.setTextColor(30, 41, 59)
        doc.text(client?.name || 'Cliente', margin, y)
        y += 6
        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139)
        if (client?.tax_id) { doc.text(`NIT/CC: ${client.tax_id}`, margin, y); y += 5; }
        if (client?.address) { doc.text(`📍 ${client.address}`, margin, y); y += 5; }

        y += 10

        // Table Header
        doc.setFillColor(248, 250, 252)
        doc.rect(margin, y, 170, 10, 'F')
        doc.setTextColor(148, 163, 184)
        doc.setFontSize(9)
        doc.text('PRODUCTO', margin + 5, y + 6.5)
        doc.text('CANT.', 120, y + 6.5, { align: 'center' })
        doc.text('PRECIO', 150, y + 6.5, { align: 'right' })
        doc.text('TOTAL', 185, y + 6.5, { align: 'right' })
        y += 15

        // Items
        doc.setTextColor(51, 65, 85)
        doc.setFontSize(11)
        items.forEach(item => {
            const name = item.product?.name || item.product_name || 'Personalizado'
            doc.text(name, margin + 5, y)
            doc.text(String(item.quantity), 120, y, { align: 'center' })
            doc.text(formatCurrency(item.unit_price), 150, y, { align: 'right' })
            doc.text(formatCurrency(item.total), 185, y, { align: 'right' })
            y += 10
            if (y > 250) { doc.addPage(); y = margin; }
        })

        y += 5
        doc.setDrawColor(226, 232, 240)
        doc.line(margin, y, 190, y)
        y += 10

        // Totals
        const totalX = 185
        doc.setFontSize(11)
        doc.text('Subtotal:', 150, y, { align: 'right' })
        doc.text(formatCurrency(subtotal), totalX, y, { align: 'right' })
        y += 7
        if (parseFloat(discountAmount) > 0) {
            doc.text('Descuento:', 150, y, { align: 'right' })
            doc.text(`-${formatCurrency(discountAmount)}`, totalX, y, { align: 'right' })
            y += 7
        }
        doc.text(`IVA (${taxRate}%):`, 150, y, { align: 'right' })
        doc.text(formatCurrency(taxAmount), totalX, y, { align: 'right' })
        y += 12

        doc.setFontSize(14)
        doc.setTextColor(37, 99, 235)
        doc.text('TOTAL:', 150, y, { align: 'right' })
        doc.text(formatCurrency(total), totalX, y, { align: 'right' })

        y += 20
        if (notes) {
            doc.setFontSize(9)
            doc.setTextColor(148, 163, 184)
            doc.text('OBSERVACIONES', margin, y)
            y += 6
            doc.setFontSize(10)
            doc.setTextColor(100, 116, 139)
            doc.text(notes, margin, y, { maxWidth: 160 })
        }

        doc.save(`${invoiceNumber || 'factura'}.pdf`)
        return doc
    }

    const handleWhatsApp = async () => {
        // Primero descargamos el PDF
        generatePDF()
        
        const clientPhone = (client?.phone || '').replace(/[\s\-\(\)]/g, '')
        const message = encodeURIComponent(
            `Hola ${client?.name || ''},\n\n` +
            `Le envío la factura *${invoiceNumber}* de *${business?.name || 'Mi Empresa'}*.\n\n` +
            `📄 Factura: ${invoiceNumber}\n` +
            `📅 Fecha: ${formatDate(invoiceDate)}\n` +
            `💰 Total: ${formatCurrency(total)}\n\n` +
            `El PDF de la factura fue descargado. Por favor adjúntelo en este chat.\n\n` +
            `Gracias por su confianza. 🙏`
        )
        const waUrl = clientPhone
            ? `https://wa.me/${clientPhone}?text=${message}`
            : `https://wa.me/?text=${message}`
        window.open(waUrl, '_blank')
    }

    return (
        <div>
            {/* Hidden Share Triggers for InvoiceView */}
            <button id="btn-pdf-template" style={{ display: 'none' }} onClick={generatePDF} />
            <button id="btn-share-template" style={{ display: 'none' }} onClick={handleWhatsApp} />

            <div className="invoice-template-wrapper">
                <div ref={templateRef} className="invoice-template">
                    {/* Header */}
                    <div className="it-header">
                        <div className="it-company">
                            <h1 className="it-company-name">{business?.name || 'Mi Empresa'}</h1>
                            {business?.email && <p className="it-company-detail">✉️ {business.email}</p>}
                            {business?.phone && <p className="it-company-detail">📞 {business.phone}</p>}
                            {business?.address && <p className="it-company-detail">📍 {business.address}</p>}
                        </div>
                        <div className="it-meta">
                            <h2 className="it-invoice-title">Factura</h2>
                            <div className="it-meta-row">
                                N°: <strong>{invoiceNumber}</strong>
                            </div>
                            <div className="it-meta-row">
                                Fecha: <strong>{formatDate(invoiceDate)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="it-body">
                        {/* Info Cards */}
                        <div className="it-info-cards">
                            <div className="it-client-section">
                                <h3 className="it-section-label">Facturar A</h3>
                                <p className="it-client-name">{client?.name || 'Cliente'}</p>
                                {client?.tax_id && <p className="it-client-detail">NIT/CC: {client.tax_id}</p>}
                                {client?.address && <p className="it-client-detail">📍 {client.address}</p>}
                            </div>
                            <div className="it-client-section" style={{ background: 'rgba(59, 130, 246, 0.03)' }}>
                                <h3 className="it-section-label">Estado de Pago</h3>
                                <p className="it-client-name" style={{ color: isPaid ? '#10b981' : '#f59e0b' }}>
                                    {isPaid ? 'Completado' : 'Pendiente'}
                                </p>
                                <p className="it-client-detail">Vence: {formatDate(dueDate || invoiceDate)}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="it-table-wrapper">
                            <table className="it-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50%' }}>Producto / Descripción</th>
                                        <th style={{ width: '10%', textAlign: 'center' }}>Cant.</th>
                                        <th style={{ width: '20%', textAlign: 'right' }}>Precio</th>
                                        <th style={{ width: '20%', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <span className="it-product-name">{item.product?.name || item.product_name || 'Personalizado'}</span>
                                                {item.description && <span className="it-product-desc">{item.description}</span>}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="it-totals">
                            <div className="it-totals-box">
                                <div className="it-totals-row">
                                    <span>Subtotal</span>
                                    <strong>{formatCurrency(subtotal)}</strong>
                                </div>
                                {parseFloat(discountAmount) > 0 && (
                                    <div className="it-totals-row" style={{ color: '#ef4444' }}>
                                        <span>Descuento</span>
                                        <strong>-{formatCurrency(discountAmount)}</strong>
                                    </div>
                                )}
                                <div className="it-totals-row">
                                    <span>IVA ({taxRate}%)</span>
                                    <strong>{formatCurrency(taxAmount)}</strong>
                                </div>
                                <div className="it-totals-final">
                                    <span>TOTAL</span>
                                    <span className="it-total-amount">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {notes && (
                            <div className="it-notes">
                                <h4>Observaciones</h4>
                                <p>{notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="it-footer">
                        <p>Gracias por su preferencia — <strong>{business?.name || 'Mi Empresa'}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    )
}
