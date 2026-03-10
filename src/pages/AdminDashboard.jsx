import { formatCurrency, formatDate } from '../utils/formatters'
import { useAuth } from '../context/AuthContext'
import { useAdminDashboard } from '../hooks/useAdminDashboard'
import { Navigate } from 'react-router-dom'
import AdminStatsCards from '../components/Admin/AdminStatsCards'
import AdminBusinessTable from '../components/Admin/AdminBusinessTable'
import AdminInvoicesTable from '../components/Admin/AdminInvoicesTable'
import './AdminDashboard.css'

export default function AdminDashboard() {
    const { isAdmin } = useAuth()
    const {
        stats,
        loading,
        error,
        activeView,
        setActiveView,
        refresh
    } = useAdminDashboard(isAdmin)

    if (!isAdmin) return <Navigate to="/" />

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
                <div className="spinner" style={{ width: 32, height: 32 }}></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="page">
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: 'var(--danger)', marginBottom: 16 }}>Error: {error}</p>
                    <button className="btn btn-primary" onClick={refresh}>Reintentar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="page admin-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="admin-badge">🛡️ SUPERUSUARIO</div>
                    <h1 className="page-title">Panel de Administración</h1>
                    <p className="page-subtitle">Vista global de toda la plataforma</p>
                </div>
                <button className="btn btn-secondary" onClick={refresh}>🔄 Actualizar</button>
            </div>

            {/* Nav tabs */}
            <div className="admin-tabs">
                {[
                    { id: 'overview', icon: '📊', label: 'Resumen' },
                    { id: 'businesses', icon: '🏢', label: 'Negocios' },
                    { id: 'invoices', icon: '🧾', label: 'Facturas' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`admin-tab ${activeView === tab.id ? 'admin-tab-active' : ''} `}
                        onClick={() => setActiveView(tab.id)}
                    >
                        <span>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* View Content */}
            <div className="admin-view-content" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {activeView === 'overview' && <AdminStatsCards stats={stats} />}

                {activeView === 'businesses' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Todos los Negocios</h3>
                            <span className="badge badge-info">{stats.recent_businesses.length} registrados</span>
                        </div>
                        <AdminBusinessTable businesses={stats.recent_businesses} />
                    </div>
                )}

                {activeView === 'invoices' && (
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Últimas Facturas (Global)</h3>
                            <span className="badge badge-info">{stats.recent_invoices.length}</span>
                        </div>
                        <AdminInvoicesTable invoices={stats.recent_invoices} />
                    </div>
                )}
            </div>
        </div>
    )
}
