import { formatCurrency } from '../../utils/formatters'

export default function AdminStatsCards({ stats }) {
    if (!stats) return null

    return (
        <>
            <div className="admin-stats-grid">
                <div className="stat-card stat-card--blue">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-value">{stats.total_businesses}</div>
                    <div className="stat-label">Negocios Registrados</div>
                </div>
                <div className="stat-card stat-card--emerald">
                    <div className="stat-icon">💰</div>
                    <div className="stat-value">{formatCurrency(stats.total_revenue)}</div>
                    <div className="stat-label">Ingresos Totales (Pagado)</div>
                </div>
                <div className="stat-card stat-card--amber">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value">{formatCurrency(stats.total_pending)}</div>
                    <div className="stat-label">Facturación Pendiente</div>
                </div>
                <div className="stat-card stat-card--purple">
                    <div className="stat-icon">🧾</div>
                    <div className="stat-value">{stats.total_invoices}</div>
                    <div className="stat-label">Facturas Totales</div>
                </div>
            </div>

            <div className="admin-row">
                <div className="stat-card admin-stat-mini">
                    <span>👥</span>
                    <div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats.total_clients}</div>
                        <div className="stat-label">Clientes</div>
                    </div>
                </div>
                <div className="stat-card admin-stat-mini">
                    <span>📦</span>
                    <div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats.total_products}</div>
                        <div className="stat-label">Productos</div>
                    </div>
                </div>
                <div className="stat-card admin-stat-mini">
                    <span>✅</span>
                    <div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats.invoices_paid}</div>
                        <div className="stat-label">Pagadas</div>
                    </div>
                </div>
                <div className="stat-card admin-stat-mini">
                    <span>🕐</span>
                    <div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats.invoices_pending}</div>
                        <div className="stat-label">Pendientes</div>
                    </div>
                </div>
                <div className="stat-card admin-stat-mini">
                    <span>⚠️</span>
                    <div>
                        <div className="stat-value" style={{ fontSize: '1.5rem' }}>{stats.invoices_overdue}</div>
                        <div className="stat-label">Vencidas</div>
                    </div>
                </div>
            </div>
        </>
    )
}
