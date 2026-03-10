import { useState, useEffect, useMemo } from 'react'
import { invoiceService } from '../services/invoiceService'
import { clientService } from '../services/clientService'
import { productService } from '../services/productService'

const RANGES = [
    { key: 'today', label: 'Hoy' },
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: '3m', label: '3 meses' },
    { key: '6m', label: '6 meses' },
    { key: '1y', label: 'Este año' },
]

// Ayudante para tratar strings YYYY-MM-DD como fecha Local, no UTC
const parseSafeDate = (dateStr) => {
    if (!dateStr) return new Date()
    if (dateStr.includes('T')) return new Date(dateStr) // Es ISO (con hora)
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d) // Constructor local
}

export function useDashboard(business) {
    const [allInvoices, setAllInvoices] = useState([])
    const [products, setProducts] = useState([])
    const [clientCount, setClientCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [range, setRange] = useState('7d')

    useEffect(() => {
        if (business) loadData()
    }, [business])

    const loadData = async () => {
        try {
            const [{ data: inv }, cc, { data: pr }] = await Promise.all([
                invoiceService.getAll(business.id, { pageSize: 1000 }),
                clientService.count(business.id),
                productService.getAll(business.id, { pageSize: 1000 }),
            ])
            setAllInvoices(Array.isArray(inv) ? inv : [])
            setClientCount(cc)
            setProducts(Array.isArray(pr) ? pr : [])
        } catch (err) {
            console.error('Error loading dashboard data:', err)
            setAllInvoices([])
        } finally {
            setLoading(false)
        }
    }

    const getNetProfit = (invoice) => {
        if (!invoice.invoice_items) return invoice.total || 0
        return invoice.invoice_items.reduce((sum, item) => {
            const product = products.find(p => p.id === item.product_id)
            const base = product ? (parseFloat(product.base_price) || 0) : 0
            return sum + (parseFloat(item.total) || 0) - base * (parseFloat(item.quantity) || 0)
        }, 0)
    }

    const rangeInvoices = useMemo(() => {
        if (!Array.isArray(allInvoices)) return []
        const now = new Date()
        return allInvoices.filter(inv => {
            const d = parseSafeDate(inv.date || inv.created_at)
            if (range === 'today') {
                const todayStr = new Date().toLocaleDateString('en-CA');
                const invDateStr = d.toLocaleDateString('en-CA');
                return invDateStr === todayStr
            }
            if (range === '7d') {
                const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7)
                return d >= cutoff
            }
            if (range === '30d') {
                const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30)
                return d >= cutoff
            }
            if (range === '3m') {
                const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3)
                return d >= cutoff
            }
            if (range === '6m') {
                const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 6)
                return d >= cutoff
            }
            if (range === '1y') {
                return d.getFullYear() === now.getFullYear()
            }
            return true
        })
    }, [allInvoices, range])

    const [stats, setStats] = useState({
        totalRevenue: 0,
        netProfit: 0,
        pendingCount: 0,
        paidCount: 0,
        totalInvoices: 0,
        rangeLabel: ''
    })

    const fetchRangeStats = async () => {
        if (!business) return
        try {
            const now = new Date()
            let startDate, endDate = now.toISOString()

            if (range === 'today') {
                startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString()
            } else if (range === '7d') {
                startDate = new Date(new Date().setDate(now.getDate() - 7)).toISOString()
            } else if (range === '30d') {
                startDate = new Date(new Date().setDate(now.getDate() - 30)).toISOString()
            } else if (range === '3m') {
                startDate = new Date(new Date().setMonth(now.getMonth() - 3)).toISOString()
            } else if (range === '6m') {
                startDate = new Date(new Date().setMonth(now.getMonth() - 6)).toISOString()
            } else if (range === '1y') {
                startDate = new Date(now.getFullYear(), 0, 1).toISOString()
            }

            const data = await invoiceService.getStatsV2(business.id, startDate, endDate)
            const rangeLabel = RANGES.find(r => r.key === range)?.label || 'periodo'
            setStats({ ...data, rangeLabel })
        } catch (err) {
            console.error('Error fetching range stats:', err)
        }
    }

    useEffect(() => {
        fetchRangeStats()
    }, [range, business])

    const chartData = useMemo(() => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const now = new Date()

        // 1. Buckets por Horas (Hoy)
        if (range === 'today') {
            const buckets = []
            for (let i = 0; i < 24; i++) {
                buckets.push({ hour: i, name: `${i}:00`, revenue: 0, profit: 0 })
            }
            rangeInvoices.forEach(inv => {
                const d = parseSafeDate(inv.date || inv.created_at)
                // Usamos la hora de created_at si existe, si no, la del objeto date
                const h = inv.created_at ? new Date(inv.created_at).getHours() : d.getHours()
                const b = buckets.find(b => b.hour === h)
                if (b) {
                    const amountPaid = parseFloat(inv.amount_paid) || 0;
                    const total = parseFloat(inv.total) || 0;
                    const realPaid = inv.status === 'paid' ? Math.max(total, amountPaid) : amountPaid;
                    const totalBaseCost = (inv.invoice_items || []).reduce((sum, item) => {
                        const product = products.find(p => p.id === item.product_id)
                        const base = product ? (parseFloat(product.base_price) || 0) : 0
                        return sum + (base * (parseFloat(item.quantity) || 0))
                    }, 0)
                    const paidRatio = total > 0 ? (realPaid / total) : 0;
                    const estimatedProfit = (total - totalBaseCost - (inv.tax_amount || 0)) * paidRatio;
                    b.revenue += realPaid;
                    b.profit += estimatedProfit;
                }
            })
            return buckets
        }

        // 2. Buckets por Días (7d / 30d)
        if (range === '7d' || range === '30d') {
            const days = range === '7d' ? 7 : 30
            const buckets = []
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date(now)
                d.setDate(d.getDate() - i)
                const key = d.toLocaleDateString('en-CA');
                buckets.push({
                    key: key,
                    name: `${d.getDate()}/${d.getMonth() + 1}`,
                    revenue: 0,
                    profit: 0,
                })
            }
            rangeInvoices.forEach(inv => {
                const d = parseSafeDate(inv.date || inv.created_at)
                const key = d.toLocaleDateString('en-CA');
                const b = buckets.find(b => b.key === key)
                if (b) {
                    const amountPaid = parseFloat(inv.amount_paid) || 0;
                    const total = parseFloat(inv.total) || 0;
                    const realPaid = inv.status === 'paid' ? Math.max(total, amountPaid) : amountPaid;
                    const totalBaseCost = (inv.invoice_items || []).reduce((sum, item) => {
                        const product = products.find(p => p.id === item.product_id)
                        const base = product ? (parseFloat(product.base_price) || 0) : 0
                        return sum + (base * (parseFloat(item.quantity) || 0))
                    }, 0)
                    const paidRatio = total > 0 ? (realPaid / total) : 0;
                    const estimatedProfit = (total - totalBaseCost - (inv.tax_amount || 0)) * paidRatio;
                    b.revenue += realPaid;
                    b.profit += estimatedProfit;
                }
            })
            return buckets
        }

        // 3. Buckets por Meses (3m / 6m / 1y)
        const monthCount = range === '3m' ? 3 : range === '6m' ? 6 : 12
        const buckets = []
        for (let i = monthCount - 1; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(1)
            d.setMonth(d.getMonth() - i)
            buckets.push({ month: d.getMonth(), year: d.getFullYear(), name: months[d.getMonth()], revenue: 0, profit: 0 })
        }
        rangeInvoices.forEach(inv => {
            const d = parseSafeDate(inv.date || inv.created_at)
            const b = buckets.find(b => b.month === d.getMonth() && b.year === d.getFullYear())
            if (b) {
                const amountPaid = parseFloat(inv.amount_paid) || 0;
                const total = parseFloat(inv.total) || 0;
                const realPaid = inv.status === 'paid' ? Math.max(total, amountPaid) : amountPaid;
                const totalBaseCost = (inv.invoice_items || []).reduce((sum, item) => {
                    const product = products.find(p => p.id === item.product_id)
                    const base = product ? (parseFloat(product.base_price) || 0) : 0
                    return sum + (base * (parseFloat(item.quantity) || 0))
                }, 0)
                const paidRatio = total > 0 ? (realPaid / total) : 0;
                const estimatedProfit = (total - totalBaseCost - (inv.tax_amount || 0)) * paidRatio;
                b.revenue += realPaid;
                b.profit += estimatedProfit;
            }
        })
        return buckets
    }, [rangeInvoices, range, products])

    return {
        loading,
        stats,
        chartData,
        clientCount,
        recentInvoices: allInvoices.slice(0, 5),
        range,
        setRange,
        RANGES
    }
}
