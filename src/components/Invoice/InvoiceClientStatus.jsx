import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function InvoiceClientStatus({ clientBalance }) {
    if (!clientBalance) return null;

    return (
        <div className="cinv-totals-box" style={{ marginTop: '1.5rem', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
            <h3 className="cinv-sidebar-title" style={{ color: 'var(--accent-secondary)', borderBottomColor: 'var(--border-color)' }}>Status Cliente</h3>
            <div className="cinv-client-summary">
                <div className="cinv-total-row">
                    <span className="cinv-label-text" style={{ color: 'var(--text-secondary)' }}>Facturas pendientes</span>
                    <span style={{ fontWeight: 700, color: clientBalance.pending > 0 ? '#f59e0b' : 'var(--accent-secondary)' }}>
                        {formatCurrency(clientBalance.pending)}
                    </span>
                </div>
                <div className="cinv-total-row">
                    <span className="cinv-label-text" style={{ color: 'var(--text-secondary)' }}>Estado</span>
                    <span style={{
                        fontWeight: 600,
                        color: clientBalance.pending === 0 ? '#10b981' : '#f59e0b',
                        fontSize: '0.8125rem'
                    }}>
                        {clientBalance.pending > 0 ? '⚠️ Con saldo pendiente' : '✅ Al día'}
                    </span>
                </div>
                <div className="cinv-total-row">
                    <span className="cinv-label-text" style={{ color: 'var(--text-secondary)' }}>Total facturas</span>
                    <span style={{ fontWeight: 600 }}>{clientBalance.total}</span>
                </div>
            </div>
        </div>
    );
}
