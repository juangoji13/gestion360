import { useState } from 'react'
import { formatCurrency } from '../../utils/formatters'

export default function PaymentModal({ invoice, onClose, onSubmit }) {
    if (!invoice) return null

    const total = parseFloat(invoice.total) || 0
    const currentPaid = parseFloat(invoice.amount_paid) || 0
    // Retrocompatibilidad: Si antes la factura fue marcada como pagada pero su amount_paid es 0
    const actualPaid = invoice.status === 'paid' ? Math.max(total, currentPaid) : currentPaid
    const pendingAmount = Math.max(0, total - actualPaid)

    // Solo podemos sugerir el input si hay algun pendiente
    const [amount, setAmount] = useState(pendingAmount > 0 ? pendingAmount : 0)
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (pendingAmount <= 0) {
            alert('Esta factura ya está pagada por completo.')
            return
        }

        const paymentAmount = parseFloat(amount)
        if (paymentAmount <= 0) return alert('El abono debe ser mayor a 0.')
        if (paymentAmount > pendingAmount) return alert('El abono no puede superar la deuda pendiente.')

        try {
            setSubmitting(true)
            await onSubmit(invoice.id, actualPaid, paymentAmount, total)
        } catch (error) {
            console.error('Error procesando pago:', error)
            alert('Error al registrar el abono.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">Registrar Abono</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ padding: 'var(--space-xl)' }}>
                        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Factura:</span>
                                <span style={{ fontWeight: '600' }}>{formatCurrency(total)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Pagado:</span>
                                <span style={{ color: 'var(--success)', fontWeight: '600' }}>{formatCurrency(actualPaid)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Balance Pendiente:</span>
                                <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{formatCurrency(pendingAmount)}</span>
                            </div>
                        </div>

                        {pendingAmount > 0 ? (
                            <div className="form-group">
                                <label className="form-label">Monto del Abono</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0.01"
                                    max={pendingAmount}
                                    step="0.01"
                                    required
                                />
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--success)', fontWeight: 'bold' }}>
                                Factura solventada en su totalidad.
                            </div>
                        )}
                    </div>

                    <div className="modal-footer" style={{ padding: 'var(--space-lg) var(--space-xl)', background: 'var(--bg-tertiary)' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }} disabled={submitting}>
                            Cancelar
                        </button>
                        {pendingAmount > 0 && (
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }} disabled={submitting}>
                                {submitting ? 'Guardando...' : 'Aplicar Abono'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
