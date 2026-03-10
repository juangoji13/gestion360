import { useState, useEffect, useCallback } from 'react'
import { clientService } from '../services/clientService'
import { useToast } from '../context/ToastContext'

export function useClients(businessId) {
    const toast = useToast()
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [pageSize] = useState(10)

    const loadClients = useCallback(async (currentPage = page) => {
        if (!businessId) return
        try {
            setLoading(true)
            const result = await clientService.getAll(businessId, {
                page: currentPage,
                pageSize,
                search
            })
            setClients(result.data || [])
            setTotalCount(result.count || 0)
        } catch (err) {
            toast.error('Error al cargar clientes')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [businessId, search, page, pageSize, toast])

    useEffect(() => {
        setPage(1)
        loadClients(1)
    }, [search])

    useEffect(() => {
        loadClients(page)
    }, [page, businessId])

    const deleteClient = async (id) => {
        try {
            await clientService.delete(id)
            toast.success('Cliente eliminado')
            loadClients()
            return true
        } catch (err) {
            toast.error('Error al eliminar cliente')
            return false
        }
    }

    return {
        clients,
        loading,
        search,
        setSearch,
        page,
        setPage,
        totalCount,
        pageSize,
        loadClients,
        deleteClient
    }
}
