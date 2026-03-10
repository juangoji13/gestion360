import { useState, useEffect, useCallback } from 'react'
import { productService } from '../services/productService'
import { invoiceService } from '../services/invoiceService'
import { useToast } from '../context/ToastContext'

export function useProducts(businessId) {
    const toast = useToast()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [pageSize] = useState(10)

    // Extra metrics state
    const [allProductsMetrics, setAllProductsMetrics] = useState([])
    const [topProducts, setTopProducts] = useState([])

    const loadProducts = useCallback(async (currentPage = page) => {
        if (!businessId) return
        try {
            setLoading(true)
            const [productsResult, invoicesResult, allProductsForMetrics] = await Promise.all([
                productService.getAll(businessId, { page: currentPage, pageSize, search }),
                invoiceService.getAll(businessId, { pageSize: 100 }), // Limit for top products
                productService.getAll(businessId, { pageSize: 1000 })
            ])

            setProducts(productsResult.data || [])
            setTotalCount(productsResult.count || 0)
            setAllProductsMetrics(allProductsForMetrics.data || [])

            // Calculate top products
            const salesMap = {}
            const invoices = invoicesResult.data
            if (Array.isArray(invoices)) {
                invoices.forEach(inv => {
                    if (!Array.isArray(inv.invoice_items)) return
                    inv.invoice_items.forEach(item => {
                        const pid = item.product_id
                        if (!pid) return
                        const productName = productsResult.data?.find(p => p.id === pid)?.name || item.description || 'Producto'
                        if (!salesMap[pid]) salesMap[pid] = { id: pid, name: productName, quantity: 0, revenue: 0 }
                        salesMap[pid].quantity += item.quantity || 0
                        salesMap[pid].revenue += (item.total || 0)
                    })
                })
            }
            const top = Object.values(salesMap)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 3)
            setTopProducts(top)

        } catch (err) {
            toast.error('Error al cargar productos')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [businessId, search, page, pageSize, toast])

    useEffect(() => {
        setPage(1)
        loadProducts(1)
    }, [search])

    useEffect(() => {
        loadProducts(page)
    }, [page, businessId])

    const deleteProduct = async (id) => {
        try {
            await productService.delete(id)
            toast.success('Producto eliminado')
            loadProducts()
            return true
        } catch (err) {
            toast.error('Error al eliminar producto')
            return false
        }
    }

    return {
        products,
        loading,
        search,
        setSearch,
        page,
        setPage,
        totalCount,
        pageSize,
        allProductsMetrics,
        topProducts,
        loadProducts,
        deleteProduct
    }
}
