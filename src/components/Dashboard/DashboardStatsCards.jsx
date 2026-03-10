import { formatCurrency } from '../../utils/formatters'

export default function DashboardStatsCards({ stats, clientCount }) {
    if (!stats) return null

    return (
        <div className="dash-stats-grid">
            <div className="stat-card stat-card--emerald">
                <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                <div className="stat-label">Ventas ({stats.rangeLabel})</div>
            </div>
            <div className="stat-card stat-card--indigo">
                <div className="stat-value">{formatCurrency(stats.netProfit ?? 0)}</div>
                <div className="stat-label">Ganancia Neta</div>
            </div>
            <div className="stat-card stat-card--blue">
                <div className="stat-value">{stats.totalInvoices}</div>
                <div className="stat-label">Comprobantes</div>
            </div>
            <div className="stat-card stat-card--amber">
                <div className="stat-value">{clientCount}</div>
                <div className="stat-label">Clientes</div>
            </div>
        </div>
    )
}
