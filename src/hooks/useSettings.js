import { useState, useRef } from 'react'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'

export function useSettings(user, business, updateUser, updateBusiness) {
    const toast = useToast()
    const fileInputRef = useRef(null)
    
    // Business Settings State
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

    // User Profile State
    const [savingUser, setSavingUser] = useState(false)
    const [isUserEditing, setIsUserEditing] = useState(false)
    const [userForm, setUserForm] = useState({
        full_name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
    })

    const hasChanges = JSON.stringify(form) !== JSON.stringify({
        name: business?.name || '',
        address: business?.address || '',
        phone: business?.phone || '',
        email: business?.email || '',
        tax_id: business?.tax_id || '',
        logo_url: business?.logo_url || '',
    })

    const hasUserChanges = JSON.stringify(userForm) !== JSON.stringify({
        full_name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
    })

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()
        setSaving(true)
        try {
            await updateBusiness(form)
            toast.success('Configuración de negocio guardada')
            setIsEditing(false)
        } catch (err) {
            toast.error(err.message || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    const handleUserSubmit = async (e) => {
        if (e) e.preventDefault()
        setSavingUser(true)
        try {
            const updates = {}
            if (userForm.full_name !== user?.user_metadata?.full_name) {
                updates.data = { full_name: userForm.full_name }
            }
            if (userForm.email !== user?.email) {
                updates.email = userForm.email
            }

            if (Object.keys(updates).length > 0) {
                await updateUser(updates)
                toast.success('Perfil personal actualizado')
                if (updates.email) {
                    toast.info('Se ha enviado un correo de confirmación a la nueva dirección')
                }
            }
            setIsUserEditing(false)
        } catch (err) {
            toast.error(err.message || 'Error al guardar perfil')
        } finally {
            setSavingUser(false)
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
            toast.error('No se pudo subir el logo. Introduce la URL directamente en el campo.')
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

    const cancelUserEditing = () => {
        setIsUserEditing(false)
        setUserForm({
            full_name: user?.user_metadata?.full_name || '',
            email: user?.email || '',
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
        fileInputRef,
        // User Profile
        userForm,
        setUserForm,
        isUserEditing,
        setIsUserEditing,
        savingUser,
        hasUserChanges,
        handleUserSubmit,
        cancelUserEditing,
    }
}
