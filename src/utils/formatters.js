export const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val || 0)
}

export const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    // Si es una fecha pura 'YYYY-MM-DD', parsearla como hora LOCAL para
    // evitar el bug UTC: new Date('2026-03-10') = medianoche UTC = día anterior en UTC-5
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number)
        return new Date(y, m - 1, d).toLocaleDateString('es-CO')
    }
    return new Date(dateStr).toLocaleDateString('es-CO')
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
