import { useState } from 'react'
import { clientService } from '../services/clientService'
import { useToast } from '../context/ToastContext'

export function useClientForm(businessId, onSuccess) {
    const toast = useToast()
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        tax_id: ''
    })

    const openCreate = () => {
        setEditing(null)
        setForm({ name: '', email: '', phone: '', address: '', tax_id: '' })
        setShowModal(true)
    }

    const openEdit = (client) => {
        setEditing(client)
        setForm({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            tax_id: client.tax_id || '',
        })
        setShowModal(true)
    }

    const setFieldValue = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setSaving(true)
        try {
            if (editing) {
                await clientService.update(editing.id, form)
                toast.success('Cliente actualizado')
            } else {
                await clientService.create({ ...form, business_id: businessId })
                toast.success('Cliente creado')
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
