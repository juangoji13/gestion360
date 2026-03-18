import React from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency, getStatusBadge } from '../../utils/formatters'

export default function RecentActivity({ recentInvoices }) {
    const statusBadge = (status) => {
        const bdg = getStatusBadge(status)
        return <span className={`dash-badge dash-badge-${status}`}>{bdg.label}</span>
    }

    return (
        <section className="dash-table-card">
            <div className="dash-table-header">
                <h3 className="dash-table-title">Actividad Reciente</h3>
                <Link to="/invoices" className="dash-table-link">Ver todas</Link>
            </div>
            
            {/* Desktop Table */}
            <div className="dash-table-wrapper desktop-only">
                {recentInvoices.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <p>No hay facturas recientes</p>
                    </div>
                ) : (
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>N° Factura</th>
                                <th>Cliente</th>
                                <th>Estado</th>
                                <th className="dash-td-right">Total</th>
                                <th style={{ textAlign: 'center' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentInvoices.map(inv => (
                                <tr key={inv.id}>
                                    <td className="dash-td-strong">
                                        <Link to={`/invoices/${inv.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {inv.invoice_number}
                                        </Link>
                                    </td>
                                    <td>{inv.client?.name || '-'}</td>
                                    <td>{statusBadge(inv.status)}</td>
                                    <td className="dash-td-right">{formatCurrency(inv.total)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <Link to={`/invoices/${inv.id}`} className="dash-table-link" style={{ fontSize: '0.75rem' }}>
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile List View */}
            <div className="mobile-only">
                {recentInvoices.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                        <p>No hay facturas recientes</p>
                    </div>
                ) : (
                    <div className="dash-mobile-list">
                        {recentInvoices.map(inv => (
                            <Link to={`/invoices/${inv.id}`} key={inv.id} className="dash-mobile-item">
                                <div className="dash-mobile-item-info">
                                    <span className="dash-mobile-item-num">{inv.invoice_number}</span>
                                    <span className="dash-mobile-item-client">{inv.client?.name || 'Cliente Genérico'}</span>
                                </div>
                                <div className="dash-mobile-item-status">
                                    <span className="dash-mobile-item-total">{formatCurrency(inv.total)}</span>
                                    {statusBadge(inv.status)}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
