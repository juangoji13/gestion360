export const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val || 0)
}

export const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    // Offset correction for local display if needed, but basic approach:
    return d.toLocaleDateString('es-CO')
}

export const getStatusBadge = (status) => {
    const badges = {
        pending: { label: 'Pendiente', class: 'status-pending' },
        paid: { label: 'Pagada', class: 'status-paid' },
        overdue: { label: 'Vencida', class: 'status-overdue' },
        cancelled: { label: 'Anulada', class: 'status-cancelled' }
    }
    return badges[status] || { label: status, class: 'status-pending' }
}
