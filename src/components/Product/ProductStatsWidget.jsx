import React from 'react'
import { CircleDollarSign, TrendingUp, Sparkles, Package } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export default function ProductStatsWidget({ stats, topProducts }) {
    return (
        <aside className="prod-aside">
            {/* Inversión en Inventario - Card principal grande */}
            <div className="prod-stats-card" style={{ padding: '1rem 1.25rem', marginBottom: '0.75rem' }}>
                <div className="prod-stats-bg-icon">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1h-9a2 2 0 00-2 2v8a2 2 0 002 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                    </svg>
                </div>
                <h3
                    className="prod-stats-label"
                    style={{ fontSize: '0.7rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <CircleDollarSign size={14} aria-hidden="true" />
                    Inversión en Inventario
                </h3>
                <div className="prod-stats-value" style={{ fontSize: '1.4rem', lineHeight: 1.2 }}>
                    {formatCurrency(stats.total_investment)}
                </div>
            </div>

            {/* P. Venta + Margen - Grid 2 columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {/* P. Venta */}
                <div style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    borderRadius: '12px',
                    padding: '0.875rem 1rem',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.85, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp size={12} aria-hidden="true" /> P. Venta
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1 }}>
                        {formatCurrency(stats.total_potential_value)}
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '0.2rem' }}>Venta total</div>
                </div>

                {/* Margen */}
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '12px',
                    padding: '0.875rem 1rem',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.85, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={12} aria-hidden="true" /> Margen
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.1 }}>
                        {stats.profit_margin.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9, marginTop: '0.1rem' }}>
                        {formatCurrency(stats.total_margin)}
                    </div>
                </div>
            </div>

            {/* Top Productos */}
            <div className="prod-aside-card">
                <div className="prod-aside-header">
                    <h3 className="prod-aside-title">Top Productos</h3>
                    <div className="prod-aside-badge">Ventas</div>
                </div>

                {topProducts.length === 0 ? (
                    <div className="prod-empty-top">
                        <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}>📈</span>
                        <p>Sin ventas registradas</p>
                    </div>
                ) : (
                    <div className="prod-top-list">
                        {topProducts.map((p, idx) => (
                            <div className="prod-top-item" key={p.id}>
                                <div className="prod-top-info">
                                    <div className={`prod-top-rank rank-${idx + 1}`}>{idx + 1}</div>
                                    <div className="prod-top-img">📦</div>
                                    <div className="prod-top-details">
                                        <div className="prod-top-name">{p.name || 'Producto'}</div>
                                        <div className="prod-top-meta">{p.quantity} {p.quantity === 1 ? 'unidad' : 'unidades'}</div>
                                    </div>
                                </div>
                                <div className="prod-top-revenue">{formatCurrency(p.revenue)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    )
}
