import { useState, useRef } from 'react'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'

export function useSettings(business, updateBusiness) {
    const toast = useToast()
    const fileInputRef = useRef(null)
    const [saving, setSaving] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const [form, setForm] = useState({
        name: business?.name || '',
        address: business?.address || '',
        phone: business?.phone || '',
        email: business?.email || '',
        tax_id: business?.tax_id || '',
        logo_url: business?.logo_url || '',
    })

    const hasChanges = JSON.stringify(form) !== JSON.stringify({
        name: business?.name || '',
        address: business?.address || '',
        phone: business?.phone || '',
        email: business?.email || '',
        tax_id: business?.tax_id || '',
        logo_url: business?.logo_url || '',
    })

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setSaving(true)
        try {
            await updateBusiness(form)
            toast.success('Configuración guardada')
            setIsEditing(false)
        } catch (err) {
            toast.error(err.message || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) { toast.error('El archivo debe ser una imagen'); return }
        if (file.size > 2 * 1024 * 1024) { toast.error('La imagen no puede ser mayor a 2MB'); return }

        setUploadingLogo(true)
        try {
            const ext = file.name.split('.').pop()
            const path = `logos/${business.id}_${Date.now()}.${ext}`
            const { error: upErr } = await supabase.storage.from('business-assets').upload(path, file, { upsert: true })
            if (upErr) throw upErr
            const { data: { publicUrl } } = supabase.storage.from('business-assets').getPublicUrl(path)
            setForm(f => ({ ...f, logo_url: publicUrl }))
            toast.success('Logo cargado. Guarda los cambios para aplicarlo.')
        } catch (err) {
            toast.error('No se pudo subir la imagen. Introduce la URL manualmente.')
            const newUrl = window.prompt('Introduce la URL del logo:', form.logo_url)
            if (newUrl !== null) setForm(f => ({ ...f, logo_url: newUrl }))
        } finally {
            setUploadingLogo(false)
        }
    }

    const cancelEditing = () => {
        setIsEditing(false)
        setForm({
            name: business?.name || '',
            address: business?.address || '',
            phone: business?.phone || '',
            email: business?.email || '',
            tax_id: business?.tax_id || '',
            logo_url: business?.logo_url || '',
        })
    }

    return {
        form,
        setForm,
        isEditing,
        setIsEditing,
        saving,
        uploadingLogo,
        hasChanges,
        handleSubmit,
        handleLogoUpload,
        cancelEditing,
        fileInputRef
    }
}
