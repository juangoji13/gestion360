import React from 'react';
import SearchableSelect from '../UI/SearchableSelect';

export default function InvoiceFormHeader({
    selectedClient,
    setSelectedClient,
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    clients
}) {
    return (
        <div className="cinv-section" style={{ borderRadius: '24px 24px 0 0', borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="cinv-section-title">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Datos del Comprobante
            </h2>

            <div className="cinv-grid-4">
                <div className="cinv-form-group">
                    <label className="cinv-label">Cliente *</label>
                    <SearchableSelect
                        options={clients}
                        value={selectedClient}
                        onChange={setSelectedClient}
                        placeholder="Seleccione un cliente..."
                        required
                    />
                </div>
                <div className="cinv-form-group">
                    <label className="cinv-label">N° Factura</label>
                    <input
                        className="cinv-input"
                        value={invoiceNumber}
                        onChange={e => setInvoiceNumber(e.target.value)}
                    />
                </div>
                <div className="cinv-form-group">
                    <label className="cinv-label">Emisión</label>
                    <input
                        type="date"
                        className="cinv-input"
                        value={invoiceDate}
                        onChange={e => setInvoiceDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
