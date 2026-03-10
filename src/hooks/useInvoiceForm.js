import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientService } from '../services/clientService'
import { productService } from '../services/productService'
import { invoiceService } from '../services/invoiceService'
import { useToast } from '../context/ToastContext'
import { FinanceUtils } from '../utils/FinanceUtils'

export function useInvoiceForm(business) {
    const toast = useToast()
    const navigate = useNavigate()

    const [clients, setClients] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [selectedClient, setSelectedClient] = useState('')
    const [invoiceNumber, setInvoiceNumber] = useState('')
    const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('en-CA'))
    const [notes, setNotes] = useState('')
    const [items, setItems] = useState([])
    const [clientBalance, setClientBalance] = useState(null)
    const [taxRate, setTaxRate] = useState(19)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [showTax, setShowTax] = useState(false)
    const [showDiscount, setShowDiscount] = useState(false)

    useEffect(() => {
        if (business) loadInitialData()
    }, [business])

    useEffect(() => {
        if (!selectedClient) { setClientBalance(null); return }
        invoiceService.getAll(business.id).then(all => {
            const clientInvs = (all.data || []).filter(inv => inv.client_id === selectedClient)
            const pending = clientInvs.filter(inv => inv.status === 'pending').reduce((s, inv) => s + (inv.total || 0), 0)
            setClientBalance({ pending, total: clientInvs.length })
        }).catch(() => setClientBalance(null))
    }, [selectedClient, business])

    const loadInitialData = async () => {
        try {
            const [cl, pr, num] = await Promise.all([
                clientService.getAll(business.id, { pageSize: 1000 }),
                productService.getAll(business.id, { pageSize: 1000 }),
                invoiceService.getNextNumber(business.id),
            ])
            setClients(cl.data || [])
            setProducts(pr.data || [])
            setInvoiceNumber(num)
            if (business?.default_tax_rate !== undefined) {
                setTaxRate(business.default_tax_rate)
            }
        } catch (err) {
            toast.error('Error al cargar datos iniciales')
        } finally {
            setLoading(false)
        }
    }

    const addItem = () => {
        setItems([...items, { product_id: '', description: '', quantity: 1, unit_price: 0, total: 0 }])
    }

    const updateItem = (index, field, value) => {
        const newItems = [...items]
        if (field === 'product_id' && value) {
            const product = products.find(p => p.id === value)
            if (product) {
                newItems[index] = {
                    ...newItems[index],
                    product_id: value,
                    product_name: product.name,
                    description: product.description?.trim() || '',
                    unit_price: product.sale_price,
                    purchase_price: product.base_price, // Capturamos el costo actual
                    total: product.sale_price * (newItems[index].quantity || 1)
                }
            }
        } else {
            newItems[index][field] = value
        }

        if (field === 'quantity' || field === 'unit_price') {
            newItems[index].total = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].unit_price) || 0)
        }
        setItems(newItems)
    }

    const removeItem = (index) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const totals = useMemo(() => {
        const subtotal = FinanceUtils.calculateSubtotal(items)
        const discount = showDiscount ? FinanceUtils.calculateDiscount(subtotal, discountAmount, 'fixed') : 0
        const taxable = Math.max(0, subtotal - discount)
        const taxRateVal = showTax ? (parseFloat(taxRate) || 0) : 0
        const tax = FinanceUtils.calculateTax(taxable, taxRateVal)
        const total = FinanceUtils.calculateFinalTotal(taxable, tax, 0)
        return { subtotal, discount, taxable, tax, total }
    }, [items, showDiscount, discountAmount, showTax, taxRate])

    // --- AUTO-SAVE LOGIC ---
    const DRAFT_KEY = business ? `invoice_draft_${business.id}` : null

    // Load draft
    useEffect(() => {
        if (!DRAFT_KEY || !business) return

        const savedDraft = localStorage.getItem(DRAFT_KEY)
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft)
                setSelectedClient(draft.selectedClient || '')
                setNotes(draft.notes || '')
                setItems(draft.items || [])
                setTaxRate(draft.taxRate ?? 19)
                setDiscountAmount(draft.discountAmount || 0)
                setShowTax(draft.showTax ?? true)
                setShowDiscount(draft.showDiscount ?? false)
                toast.success('Borrador recuperado automáticamente')
            } catch (err) {
                console.error('Error loading draft', err)
            }
        }
    }, [DRAFT_KEY])

    // Save draft
    useEffect(() => {
        if (!DRAFT_KEY) return

        const draft = {
            selectedClient,
            notes,
            items,
            taxRate,
            discountAmount,
            showTax,
            showDiscount,
            updatedAt: new Date().toISOString()
        }

        // Only save if there's significant data
        if (selectedClient || items.length > 0 || notes) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        }
    }, [selectedClient, notes, items, taxRate, discountAmount, showTax, showDiscount, DRAFT_KEY])

    const clearDraft = () => {
        if (DRAFT_KEY) {
            localStorage.removeItem(DRAFT_KEY)
            // Reset form
            setSelectedClient('')
            setNotes('')
            setItems([])
            setShowDiscount(false)
            setDiscountAmount(0)
            toast.success('Borrador descartado')
        }
    }
    // -----------------------

    const saveInvoice = async () => {
        if (!selectedClient) throw new Error('Selecciona un cliente')
        if (items.length === 0) throw new Error('Agrega al menos un producto o servicio')
        if (items.some(i => (!i.product_id && !i.product_name) || i.total <= 0)) {
            throw new Error('Cada producto debe tener nombre y precio válido')
        }

        // Stock validation
        for (const item of items) {
            if (!item.product_id) continue
            const product = products.find(p => p.id === item.product_id)
            if (product && product.stock > 0 && (parseFloat(item.quantity) || 0) > product.stock) {
                throw new Error(`"${product.name}" solo tiene ${product.stock} unidades en stock`)
            }
        }

        setSaving(true)
        try {
            const invoice = {
                business_id: business.id,
                client_id: selectedClient,
                invoice_number: invoiceNumber,
                date: invoiceDate,
                subtotal: totals.subtotal,
                tax_rate: showTax ? (parseFloat(taxRate) || 0) : 0,
                tax_amount: totals.tax,
                discount_amount: showDiscount ? (parseFloat(discountAmount) || 0) : 0,
                total: totals.total,
                status: 'pending',
                notes,
            }

            const invoiceItems = items.map(item => {
                // Obtener el precio de compra del catálogo de productos para calcular ganancia
                const product = products.find(p => p.id === item.product_id)
                const purchasePrice = product ? (parseFloat(product.base_price) || 0) : 0
                return {
                    product_id: item.product_id || null,
                    product_name: item.product_name || item.description || 'Personalizado',
                    description: item.description,
                    quantity: parseFloat(item.quantity) || 0,
                    unit_price: parseFloat(item.unit_price) || 0,
                    total: item.total,
                    purchase_price: purchasePrice,
                }
            })

            const created = await invoiceService.create(invoice, invoiceItems)

            // Clear draft on success
            if (DRAFT_KEY) localStorage.removeItem(DRAFT_KEY)

            return created
        } finally {
            setSaving(false)
        }
    }

    return {
        clients, products, loading, saving,
        selectedClient, setSelectedClient,
        invoiceNumber, setInvoiceNumber,
        invoiceDate, setInvoiceDate,
        notes, setNotes,
        items, addItem, updateItem, removeItem,
        clientBalance,
        taxRate, setTaxRate,
        discountAmount, setDiscountAmount,
        showTax, setShowTax,
        showDiscount, setShowDiscount,
        totals,
        saveInvoice,
        clearDraft,
        hasDraft: !!(DRAFT_KEY && localStorage.getItem(DRAFT_KEY))
    }
}
