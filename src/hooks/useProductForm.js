import { useState } from 'react'
import { productService } from '../services/productService'
import { useToast } from '../context/ToastContext'

export function useProductForm(businessId, onSuccess) {
    const toast = useToast()
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({
        name: '',
        description: '',
        base_price: '',
        sale_price: '',
        stock: '',
        unit: 'und',
        sku: '',
        track_stock: true
    })

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', description: '', base_price: '', sale_price: '', stock: '', unit: 'und', sku: '', track_stock: true })
        setShowModal(true)
    }

    const openEdit = (product) => {
        setEditing(product)
        setForm({
            name: product.name || '',
            description: product.description || '',
            base_price: product.base_price?.toString() || '',
            sale_price: product.sale_price?.toString() || '',
            stock: product.stock?.toString() || '',
            unit: product.unit || '',
            sku: product.sku || '',
            track_stock: product.track_stock !== undefined ? product.track_stock : true,
        })
        setShowModal(true)
    }

    const setFieldValue = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setSaving(true)
        
        const round2 = (val) => Math.round((val + Number.EPSILON) * 100) / 100;

        try {
            const data = {
                ...form,
                base_price: round2(parseFloat(form.base_price) || 0),
                sale_price: round2(parseFloat(form.sale_price) || 0),
                stock: round2(parseFloat(form.stock) || 0),
                unit: form.unit || ''
            }

            if (editing) {
                await productService.update(editing.id, data)
                toast.success('Producto actualizado')
            } else {
                await productService.create({ ...data, business_id: businessId })
                toast.success('Producto creado')
            }
            setShowModal(false)
            if (onSuccess) onSuccess()
        } catch (err) {
            toast.error(err.message || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    return {
        showModal,
        setShowModal,
        saving,
        editing,
        form,
        openCreate,
        openEdit,
        setFieldValue,
        handleSubmit
    }
}
