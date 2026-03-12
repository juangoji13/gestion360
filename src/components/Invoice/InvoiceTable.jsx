import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, CheckSquare, Trash2, DollarSign, Pencil } from 'lucide-react'
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/formatters'

export default function InvoiceTable({ invoices, onStatusChange, onDelete, onAddPayment }) {
    const statusBadge = (status) => {
        const s = getStatusBadge(status)
        return <span className={`inv-badge ${s.class}`}>{s.label}</span>
    }

    const renderAmount = (inv) => {
        const total = parseFloat(inv.total) || 0;
        const paid = parseFloat(inv.amount_paid) || 0;
        const actualPaid = inv.status === 'paid' ? Math.max(total, paid) : paid;
        const pending = Math.max(0, total - actualPaid);

        return (
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(total)}</span>
                {pending > 0 && inv.status !== 'paid' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>Pendiente: {formatCurrency(pending)}</span>
                )}
                {actualPaid > 0 && pending === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>Pagado</span>
                )}
            </div>
        )
    }

    return (
        <div className="inv-table-wrapper">
            <table className="inv-table">
                <thead>
                    <tr>
                        <th>N° Factura</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                                <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
                                    <svg style={{ margin: '0 auto', width: '40px', height: '40px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p style={{ color: '#475569', fontWeight: 500 }}>No se encontraron facturas</p>
                            </td>
                        </tr>
                    ) : (
                        invoices.map(inv => (
                            <tr key={inv.id}>
                                <td className="inv-number">{inv.invoice_number}</td>
                                <td className="inv-client">{inv.client?.name || '-'}</td>
                                <td className="inv-date">{formatDate(inv.date)}</td>
                                <td>{statusBadge(inv.status)}</td>
                                <td className="inv-amount" style={{ textAlign: 'right' }}>{renderAmount(inv)}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                        <Link to={`/invoices/${inv.id}`} className="inv-action-btn" title="Ver">
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/invoices/edit/${inv.id}`} className="inv-action-btn" title="Editar" style={{ color: 'var(--accent-primary)' }}>
                                            <Pencil size={18} />
                                        </Link>
                                        {inv.status !== 'paid' && (
                                            <button
                                                onClick={() => onAddPayment(inv)}
                                                className="inv-action-btn"
                                                title="Registrar Abono"
                                                style={{ color: 'var(--success)' }}
                                            >
                                                <DollarSign size={18} />
                                            </button>
                                        )}
                                        {inv.status === 'pending' && (
                                            <button
                                                onClick={() => onStatusChange(inv, 'paid')}
                                                className="inv-action-btn inv-status-btn"
                                                title="Marcar como Pagada Contado"
                                            >
                                                <CheckSquare size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete(inv)}
                                            className="inv-action-btn inv-delete-btn"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
