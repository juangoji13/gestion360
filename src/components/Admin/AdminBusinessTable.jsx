import { formatCurrency, formatDate } from '../../utils/formatters'

export default function AdminBusinessTable({ businesses }) {
    if (!businesses || businesses.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🏢</div>
                <p className="empty-state-title">Sin negocios aún</p>
                <p className="empty-state-text">Los negocios aparecerán aquí cuando los usuarios se registren.</p>
            </div>
        )
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Negocio</th>
                        <th>Email Usuario</th>
                        <th>Facturas</th>
                        <th>Ingresos</th>
                        <th>Registrado</th>
                    </tr>
                </thead>
                <tbody>
                    {businesses.map(biz => (
                        <tr key={biz.id}>
                            <td>
                                <div style={{ fontWeight: 700 }}>{biz.name}</div>
                                {biz.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{biz.email}</div>}
                            </td>
                            <td>{biz.user_email}</td>
                            <td>
                                <span className="badge badge-info">{biz.invoice_count}</span>
                            </td>
                            <td style={{ fontWeight: 700 }}>{formatCurrency(biz.revenue)}</td>
                            <td>{formatDate(biz.created_at)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
