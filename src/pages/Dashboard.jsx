import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../hooks/useDashboard'
import DashboardStatsCards from '../components/Dashboard/DashboardStatsCards'
import RevenueChart from '../components/Dashboard/RevenueChart'
import RecentActivity from '../components/Dashboard/RecentActivity'
import './Dashboard.css'

export default function Dashboard() {
    const { business } = useAuth()
    const navigate = useNavigate()

    const {
        loading,
        stats,
        chartData,
        clientCount,
        recentInvoices,
        range,
        setRange,
        RANGES
    } = useDashboard(business)

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
            </div>
        )
    }

    return (
        <div className="dash-container">
            <header className="dash-header">
                <h2 className="dash-title">Dashboard</h2>
            </header>

            <div className="dash-main-layout">
                <main className="dash-main">
                    <DashboardStatsCards stats={stats} clientCount={clientCount} />

                    <RevenueChart
                        chartData={chartData}
                        range={range}
                        setRange={setRange}
                        ranges={RANGES}
                        stats={stats}
                    />

                    <RecentActivity recentInvoices={recentInvoices} />
                </main>

                <aside className="dash-aside">
                    {/* Actions Corner */}
                    <div className="dash-middle-card">
                        <h3 className="dash-section-title" style={{ marginBottom: '1rem' }}>Operaciones</h3>
                        <div className="dash-actions-list">
                            <button className="dash-action-btn dash-action-primary" onClick={() => navigate('/invoices/new')}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                Nueva Factura
                            </button>
                            <button className="dash-action-btn dash-action-secondary" onClick={() => navigate('/clients')}>
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                Nuevo Cliente
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Aside */}
                    <div className="dash-middle-card" style={{ marginTop: '1rem' }}>
                        <h3 className="dash-section-title" style={{ marginBottom: '1rem' }}>Resumen Rápido</h3>
                        {[
                            { label: 'Facturas pendientes', value: stats.pendingCount, color: '#f59e0b' },
                            { label: 'Facturas pagadas', value: stats.paidCount, color: '#10b981' },
                            { label: 'Clientes totales', value: clientCount, color: '#3b82f6' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '0.8625rem', color: '#475569' }}>{item.label}</span>
                                <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    )
}
