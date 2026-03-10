import React from 'react';

export default function InvoiceNotes({ notes, setNotes }) {
    return (
        <div className="cinv-totals-section" style={{ marginTop: 'auto', borderTop: '2px solid #f1f5f9', paddingTop: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div className="cinv-form-group">
                    <label className="cinv-label">Notas Adicionales (Visibles en la factura)</label>
                    <textarea
                        className="cinv-input"
                        rows="4"
                        placeholder="Instrucciones de pago, garantías, o agradecimientos..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        style={{ resize: 'none' }}
                    ></textarea>
                </div>
            </div>
        </div>
    );
}
