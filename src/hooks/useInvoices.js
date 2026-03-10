import { useState, useEffect, useMemo } from 'react'
import { invoiceService } from '../services/invoiceService'
import { useToast } from '../context/ToastContext'

export function useInvoices(business) {
    const toast = useToast()
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const pageSize = 10

    useEffect(() => {
        if (business) {
            setPage(1)
            loadInvoices(1)
        }
    }, [business, filter, search])

    useEffect(() => {
        if (business) loadInvoices(page)
    }, [page])

    const loadInvoices = async (currentPage = page) => {
        try {
            setLoading(true)
            const { data, count } = await invoiceService.getAll(business.id, {
                page: currentPage,
                pageSize,
                status: filter,
                search
            })
            setInvoices(data || [])
            setTotalCount(count || 0)
        } catch (err) {
            toast.error('Error al cargar facturas')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (invoice, newStatus) => {
        try {
            await invoiceService.updateStatus(invoice.id, newStatus)
            toast.success(`Factura marcada como ${newStatus === 'paid' ? 'pagada' : newStatus}`)
            loadInvoices()
        } catch (err) {
            toast.error('Error al actualizar estado')
        }
    }

    const executeDelete = async () => {
        if (!confirmDelete) return
        try {
            await invoiceService.delete(confirmDelete.id)
            toast.success('Factura eliminada')
            loadInvoices()
        } catch (err) {
            toast.error('Error al eliminar')
        } finally {
            setConfirmDelete(null)
        }
    }

    const handleAddPayment = async (invoiceId, currentAmountPaid, newPaymentAmount, totalInvoiceAmount) => {
        try {
            await invoiceService.addPayment(invoiceId, currentAmountPaid, newPaymentAmount, totalInvoiceAmount)
            toast.success(`Abono registrado correctamente`)
            loadInvoices()
        } catch (err) {
            toast.error('Error al registrar abono')
            throw err
        }
    }

    const stats = useMemo(() => {
        const safeInvoices = Array.isArray(invoices) ? invoices : [];
        const totalPending = safeInvoices
            .filter(i => i.status === 'pending' || i.status === 'overdue') // Overdue también debería sumar a pendientes.
            .reduce((sum, i) => {
                const total = parseFloat(i.total) || 0;
                const paid = parseFloat(i.amount_paid) || 0;
                const actualPaid = i.status === 'paid' ? Math.max(total, paid) : paid;
                return sum + Math.max(0, total - actualPaid);
            }, 0)
        return { totalPending }
    }, [invoices])

    return {
        invoices,
        loading,
        filter,
        setFilter,
        search,
        setSearch,
        confirmDelete,
        setConfirmDelete,
        page,
        setPage,
        totalCount,
        pageSize,
        handleStatusChange,
        executeDelete,
        handleAddPayment,
        stats
    }
}
