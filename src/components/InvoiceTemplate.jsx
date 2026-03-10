import { useRef } from 'react'
import { toPng } from 'html-to-image'
import { formatCurrency, formatDate } from '../utils/formatters'
import './InvoiceTemplate.css'

export default function InvoiceTemplate({ business, client, invoiceNumber, invoiceDate, items, subtotal, taxRate, taxAmount, discountAmount, total, notes, onImageGenerated, dueDate }) {
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

    const handleDownload = async () => {
        const dataUrl = await generateImage()
        if (!dataUrl) { console.error('No se pudo generar la imagen de la factura'); return }
        const link = document.createElement('a')
        link.download = `${invoiceNumber || 'factura'}.png`
        link.href = dataUrl
        link.click()
        if (onImageGenerated) onImageGenerated(dataUrl)
    }

    const handleWhatsApp = async () => {
        const dataUrl = await generateImage()
        if (dataUrl) {
            const link = document.createElement('a')
            link.download = `${invoiceNumber || 'factura'}.png`
            link.href = dataUrl
            link.click()
        }
        if (navigator.share && dataUrl) {
            try {
                const response = await fetch(dataUrl)
                const blob = await response.blob()
                const file = new File([blob], `${invoiceNumber || 'factura'}.png`, { type: 'image/png' })
                await navigator.share({
                    title: `Factura ${invoiceNumber}`,
                    text: `Factura ${invoiceNumber} - ${business?.name || 'Mi Empresa'}\nTotal: ${formatCurrency(total)}`,
                    files: [file],
                })
                return
            } catch (e) { /* Fallback */ }
        }
        const clientPhone = (client?.phone || '').replace(/[\s\-\(\)]/g, '')
        const message = encodeURIComponent(
            `Hola ${client?.name || ''},\n\n` +
            `Le envío la factura *${invoiceNumber}* de *${business?.name || 'Mi Empresa'}*.\n\n` +
            `📄 Factura: ${invoiceNumber}\n` +
            `📅 Fecha: ${formatDate(invoiceDate)}\n` +
            `💰 Total: ${formatCurrency(total)}\n\n` +
            `La imagen de la factura fue descargada. Por favor adjúntela en este chat.\n\n` +
            `Gracias por su preferencia. 🙏`
        )
        const waUrl = clientPhone
            ? `https://wa.me/${clientPhone}?text=${message}`
            : `https://wa.me/?text=${message}`
        window.open(waUrl, '_blank')
    }

    return (
        <div>
            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    📥 Descargar PNG
                </button>
                <button
                    onClick={handleWhatsApp}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '9px 20px', background: '#25D366', color: 'white',
                        border: 'none', borderRadius: 6, fontSize: '0.875rem',
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1fb855'}
                    onMouseLeave={e => e.currentTarget.style.background = '#25D366'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Enviar por WhatsApp
                </button>
            </div>

            {/* Invoice Template */}
            <div className="invoice-template-wrapper">
                <div ref={templateRef} className="invoice-template">

                    {/* Header */}
                    <div className="it-header">
                        <div className="it-company">
                            {business?.logo_url ? (
                                <img src={business.logo_url} alt="Logo" className="it-logo" />
                            ) : (
                                <img src="/logo.png" alt="Logo" className="it-logo" />
                            )}
                            <div>
                                <h1 className="it-company-name">{business?.name || 'Mi Empresa'}</h1>
                                <div>
                                    {business?.email && <p className="it-company-detail">✉️ {business.email}</p>}
                                    {business?.phone && <p className="it-company-detail">📞 {business.phone}</p>}
                                    {business?.address && <p className="it-company-detail">📍 {business.address}</p>}
                                    {business?.tax_id && <p className="it-company-detail">🏛️ NIT: {business.tax_id}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="it-meta">
                            <h2 className="it-invoice-title">Factura</h2>
                            <div className="it-meta-row">
                                <span>N°:</span>
                                <strong>{invoiceNumber}</strong>
                            </div>
                            <div className="it-meta-row">
                                <span>Fecha:</span>
                                <strong>{formatDate(invoiceDate)}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="it-body">

                        {/* Client */}
                        <div className="it-client-section">
                            <h3 className="it-section-label">Facturar A</h3>
                            <p className="it-client-name">{client?.name || 'Cliente'}</p>
                            {client?.tax_id && <p className="it-client-detail">NIT/CC: {client.tax_id}</p>}
                            {client?.address && <p className="it-client-detail">📍 {client.address}</p>}
                            {client?.email && <p className="it-client-detail">✉️ {client.email}</p>}
                            {client?.phone && <p className="it-client-detail">📞 {client.phone}</p>}
                        </div>

                        {/* Items Table */}
                        <div className="it-table-wrapper">
                            <table className="it-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '5%' }}>#</th>
                                        <th style={{ width: '25%' }}>Producto</th>
                                        <th style={{ width: '25%' }}>Descripción</th>
                                        <th style={{ width: '10%', textAlign: 'center' }}>Cant.</th>
                                        <th style={{ width: '15%', textAlign: 'right' }}>Precio Unit.</th>
                                        <th style={{ width: '20%', textAlign: 'right' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, idx) => {
                                        const productName = item.product?.name || item.product_name || 'Personalizado'
                                        return (
                                            <tr key={idx}>
                                                <td style={{ color: '#9ca3af', fontWeight: 600 }}>{String(idx + 1).padStart(2, '0')}</td>
                                                <td style={{ fontWeight: 600, color: '#0f172a' }}>{productName}</td>
                                                <td style={{ fontWeight: 400, color: '#475569', wordBreak: 'break-word', fontSize: '0.9em' }}>{item.description || '-'}</td>
                                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(item.total)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="it-totals">
                            <div className="it-totals-box">
                                <div className="it-totals-row">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                {parseFloat(discountAmount) > 0 && (
                                    <div className="it-totals-row" style={{ color: '#ef4444' }}>
                                        <span>Descuento</span>
                                        <span>-{formatCurrency(discountAmount)}</span>
                                    </div>
                                )}
                                <div className="it-totals-row">
                                    <span>IVA ({taxRate}%)</span>
                                    <span>{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="it-totals-row it-totals-final">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
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

                    {/* Footer */}
                    <div className="it-footer">
                        <p>Gracias por su confianza — <strong style={{ color: '#4b5563' }}>{business?.name || 'Mi Empresa'}</strong></p>
                    </div>

                </div>
            </div>
        </div>
    )
}
