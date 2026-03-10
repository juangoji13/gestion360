import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export default function RevenueChart({ chartData, range, setRange, ranges, stats }) {
    const isEmpty = chartData.every(d => d.revenue === 0)

    return (
        <div className="dash-middle-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 className="dash-section-title" style={{ margin: 0 }}>
                    Ingresos vs Ganancia Neta
                </h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                    {ranges.map(r => (
                        <button
                            key={r.key}
                            onClick={() => setRange(r.key)}
                            style={{
                                padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 600,
                                border: range === r.key ? 'none' : '1px solid #e2e8f0',
                                background: range === r.key ? 'var(--accent-primary)' : 'transparent',
                                color: range === r.key ? '#fff' : '#64748b',
                                cursor: 'pointer', transition: 'all 0.15s',
                                boxShadow: range === r.key ? '0 2px 8px rgba(13,148,136,0.3)' : 'none',
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="dash-chart-container" style={{ height: '300px', width: '100%', padding: '1rem 0', position: 'relative' }}>
                {isEmpty ? (
                    <div className="dash-empty-chart">
                        <div className="dash-empty-icon"><BarChart3 size={48} color="#94a3b8" /></div>
                        <p>No hay datos para este período</p>
                        <span>Crea facturas para ver las estadísticas</span>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={(v) => v === 0 ? '$0' : `$${v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000).toFixed(0) + 'k'}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                formatter={(value, name) => [formatCurrency(value), name === 'revenue' ? 'Ingresos' : 'Ganancia Neta']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" fillOpacity={1} fill="url(#colorProfit)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Período: <strong style={{ color: '#0f172a' }}>{formatCurrency(stats.totalRevenue)}</strong> en ventas
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Ganancia neta: <strong style={{ color: '#10b981' }}>{formatCurrency(stats.netProfit)}</strong>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Margen: <strong style={{ color: '#6366f1' }}>{stats.totalRevenue > 0 ? Math.round((stats.netProfit / stats.totalRevenue) * 100) : 0}%</strong>
                </span>
            </div>
        </div>
    )
}
