import React, { useState } from 'react'

export default function DateRangeModal({ isOpen, onClose, onConfirm, title }) {
    const today = new Date().toISOString().split('T')[0]
    const [fromDate, setFromDate] = useState(today)
    const [toDate, setToDate] = useState(today)

    if (!isOpen) return null

    const handleSubmit = (e) => {
        e.preventDefault()
        if (new Date(fromDate) > new Date(toDate)) {
            alert('La fecha "Desde" no puede ser mayor a la fecha "Hasta"')
            return
        }
        onConfirm({ from: fromDate, to: toDate })
    }

    return (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
            <div className="modal" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{title || 'Reporte de Pagos / Caja'}</h3>
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body" style={{ padding: 'var(--space-xl)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            Seleccione el periodo de tiempo para el cual desea generar el reporte PDF.
                        </p>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Desde</label>
                            <input
                                type="date"
                                className="form-input"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Hasta</label>
                            <input
                                type="date"
                                className="form-input"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ padding: 'var(--space-lg) var(--space-xl)', background: 'var(--bg-tertiary)' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Generar PDF
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
