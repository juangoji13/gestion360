import { formatCurrency, formatDate } from '../../utils/formatters'

export default function AdminInvoicesTable({ invoices }) {
    if (!invoices || invoices.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🧾</div>
                <p className="empty-state-title">Sin facturas aún</p>
                <p className="empty-state-text">Las facturas aparecerán aquí cuando los usuarios las creen.</p>
            </div>
        )
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>N° Factura</th>
                        <th>Negocio</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id}>
                            <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{inv.invoice_number}</td>
                            <td>{inv.business_name || '-'}</td>
                            <td>{inv.client_name || '-'}</td>
                            <td style={{ fontWeight: 700 }}>{formatCurrency(inv.total)}</td>
                            <td>
                                <span className={`badge ${inv.status === 'paid' ? 'badge-success' : inv.status === 'overdue' ? 'badge-danger' : 'badge-warning'} `}>
                                    {inv.status === 'paid' ? 'Pagada' : inv.status === 'overdue' ? 'Vencida' : inv.status === 'pending' ? 'Pendiente' : inv.status}
                                </span>
                            </td>
                            <td>{formatDate(inv.date)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
