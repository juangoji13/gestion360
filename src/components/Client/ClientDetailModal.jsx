import React from 'react'
import { Pencil, CircleDollarSign, TrendingUp, FileText, AlertTriangle, CheckCircle2, Building2, Phone, MapPin, Sparkles } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/formatters'

export default function ClientDetailModal({
    client,
    onClose,
    onEdit,
    onNavigateInvoice,
    onStatusChange,
    onAddPayment,
    invoices = [],
    products = []
}) {
    if (!client) return null

    // Calculate stats (keeping original logic for now)
    const clientInvoices = invoices.filter(inv => inv.client_id === client.id)
    const totalPurchased = clientInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0)

    let totalProfit = 0
    clientInvoices.forEach(inv => {
        const total = parseFloat(inv.total) || 0;
        const paid = parseFloat(inv.amount_paid) || 0;
        const actualPaid = inv.status === 'paid' ? Math.max(total, paid) : paid;

        const totalBaseCost = (inv.invoice_items || []).reduce((sum, item) => {
            const product = products.find(p => p.id === item.product_id)
            const basePrice = product ? (parseFloat(product.base_price) || 0) : 0
            return sum + (basePrice * (parseFloat(item.quantity) || 0))
        }, 0)

        const paidRatio = total > 0 ? (actualPaid / total) : 0;
        const estimatedProfit = (total - totalBaseCost - (inv.tax_amount || 0)) * paidRatio;
        totalProfit += estimatedProfit;
    })

    const stats = {
        invoicesCount: clientInvoices.length,
        totalPurchased,
        totalProfit,
        recentInvoices: [...clientInvoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    }

    const pending = clientInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => {
        const total = parseFloat(i.total) || 0;
        const paid = parseFloat(i.amount_paid) || 0;
        const actualPaid = i.status === 'paid' ? Math.max(total, paid) : paid;
        return sum + Math.max(0, total - actualPaid);
    }, 0)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', width: '95%' }}>
                <div className="modal-header" style={{ background: 'linear-gradient(90deg,#1e3a8a,#2563eb)', borderRadius: '12px 12px 0 0', padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                            {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="modal-title" style={{ color: 'white', margin: 0 }}>{client.name}</h3>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8125rem', margin: 0 }}>{client.email || client.phone || 'Sin contacto registrado'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => { onClose(); onEdit(client) }}
                            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Pencil size={14} /> Editar
                        </button>
                        <button className="modal-close" onClick={onClose} style={{ color: 'white' }}>×</button>
                    </div>
                </div>

                <div style={{ padding: '1.5rem 2rem', maxHeight: '75vh', overflowY: 'auto' }}>
                    {/* Info Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Total Compras', value: formatCurrency(stats.totalPurchased), color: '#1e3a8a', icon: <CircleDollarSign size={24} /> },
                            { label: 'Ganancia Neta', value: formatCurrency(stats.totalProfit), color: '#10b981', icon: <TrendingUp size={24} /> },
                            { label: 'Facturas', value: stats.invoicesCount, color: '#7c3aed', icon: <FileText size={24} /> },
                            { label: 'Pendiente', value: formatCurrency(pending), color: pending > 0 ? '#f59e0b' : '#10b981', icon: pending > 0 ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} /> },
                        ].map((card, i) => (
                            <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem' }}>
                                <div style={{ marginBottom: '0.125rem', color: card.color }}>{card.icon}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: card.color, marginTop: '0.25rem', wordBreak: 'break-word' }}>{card.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Info Row */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                        {client.tax_id && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#475569', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' }}><Building2 size={12} /> NIT: <strong>{client.tax_id}</strong></span>}
                        {client.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#475569', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' }}><Phone size={12} /> <strong>{client.phone}</strong></span>}
                        {client.address && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#475569', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px' }}><MapPin size={12} /> <strong>{client.address}</strong></span>}
                        {stats.totalPurchased > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: '#fff', fontWeight: 600, background: '#10b981', borderRadius: 6, padding: '3px 10px' }}>
                                <Sparkles size={12} /> Margen: {Math.round((stats.totalProfit / stats.totalPurchased) * 100)}%
                            </span>
                        )}
                    </div>

                    {/* Recent Invoices */}
                    <h4 style={{ margin: '0 0 0.75rem', color: '#0f172a', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Historial de Facturas ({stats.invoicesCount})
                    </h4>
                    {stats.recentInvoices.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', padding: '2rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                            Aún no hay facturas para este cliente.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                            {stats.recentInvoices.map(inv => (
                                <div
                                    key={inv.id}
                                    onClick={() => onNavigateInvoice(inv.id)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#10b981' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0' }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                            {inv.invoice_number || 'Borrador'}
                                            <svg style={{ width: 12, height: 12, color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.125rem' }}>{formatDate(inv.date)}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                                        {inv.status !== 'paid' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onAddPayment(inv) }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#10b981',
                                                    cursor: 'pointer',
                                                    padding: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                title="Registrar Abono"
                                            >
                                                <CircleDollarSign size={18} />
                                            </button>
                                        )}
                                        {inv.status === 'paid' ? (
                                            <span style={{
                                                fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                                                background: '#d1fae5', color: '#065f46', display: 'inline-block'
                                            }}>
                                                Pagada
                                            </span>
                                        ) : (
                                            <select
                                                value={inv.status}
                                                onChange={e => onStatusChange(inv.id, e.target.value)}
                                                style={{
                                                    fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, border: 'none', cursor: 'pointer', outline: 'none',
                                                    background: inv.status === 'pending' ? '#fef3c7' : '#fef2f2',
                                                    color: inv.status === 'pending' ? '#92400e' : '#991b1b'
                                                }}
                                            >
                                                <option value="pending">Pendiente</option>
                                                <option value="overdue">Vencida</option>
                                            </select>
                                        )}
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{formatCurrency(inv.total)}</span>
                                            {inv.status === 'pending' && <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>Pendiente: {formatCurrency(Math.max(0, (parseFloat(inv.total) || 0) - (parseFloat(inv.amount_paid) || 0)))}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
