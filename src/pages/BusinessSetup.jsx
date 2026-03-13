import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import './BusinessSetup.css'

export default function BusinessSetup() {
    const { user, fetchBusiness } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef(null)

    const userEmail = user?.email || ''
    const userName = user?.user_metadata?.full_name || ''
    const businessNameMeta = user?.user_metadata?.business_name || ''

    const [form, setForm] = useState({
        name: businessNameMeta || userName || '',
        tax_id: '',
        address: '',
        phone: '',
        email: userEmail,
        password: '', // Nueva contraseña para App móvil
    })
    const [logoFile, setLogoFile] = useState(null)
    const [logoPreview, setLogoPreview] = useState(null)

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const handleLogoSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten archivos de imagen')
            return
        }
        if (file.size > 2 * 1024 * 1024) {
            setError('La imagen no puede superar 2MB')
            return
        }
        setLogoFile(file)
        setLogoPreview(URL.createObjectURL(file))
        setError('')
    }

    const removeLogo = () => {
        setLogoFile(null)
        setLogoPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Prevents double submission when already loading
        if (loading) return

        setError('')

        if (!form.name.trim()) {
            setError('El nombre del negocio es obligatorio')
            return
        }

        setLoading(true)
        try {
            // 1. Si el usuario es de Google y puso una contraseña, actualizarla primero
            if (form.password && form.password.length >= 6) {
                const { error: pwdErr } = await supabase.auth.updateUser({
                    password: form.password
                })
                if (pwdErr) throw pwdErr
            } else if (user?.app_metadata?.provider === 'google' && !form.password) {
                 // Si es google y no puso clave, dar error (opcional pero recomendado por el plan)
                 throw new Error('Debes definir una contraseña para poder usar la App móvil.')
            }

            let logoUrl = null

            // Upload logo if selected
            if (logoFile) {
                const ext = logoFile.name.split('.').pop()
                const path = `${user.id}/logo.${ext}`
                const { error: uploadErr } = await supabase.storage
                    .from('logos')
                    .upload(path, logoFile, { upsert: true })
                if (uploadErr) throw uploadErr

                const { data: urlData } = supabase.storage
                    .from('logos')
                    .getPublicUrl(path)
                logoUrl = urlData.publicUrl
            }

            const { error: insertErr } = await supabase
                .from('businesses')
                .insert([{
                    user_id: user.id,
                    name: form.name.trim(),
                    tax_id: form.tax_id.trim() || null,
                    address: form.address.trim() || null,
                    phone: form.phone.trim() || null,
                    email: form.email.trim() || null,
                    logo_url: logoUrl,
                }])

            // If it violates the new UNIQUE constraint, we handle the error securely
            if (insertErr && insertErr.code === '23505') {
                // Already exists
                await fetchBusiness(user.id)
                window.location.href = '/'
                return;
            } else if (insertErr) {
                throw insertErr
            }

            await fetchBusiness(user.id)
            window.location.href = '/'
        } catch (err) {
            setError(err.message || 'Error al configurar el negocio')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="setup-page">
            <div className="setup-card">
                <div className="setup-header">
                    <div className="setup-icon">🏢</div>
                    <h1 className="setup-title">Configura tu Negocio</h1>
                    <p className="setup-subtitle">
                        Completa la información de tu empresa para comenzar a usar el ERP.
                    </p>
                    {userEmail && (
                        <div className="setup-user-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            <span>{userEmail}</span>
                        </div>
                    )}
                </div>

                {error && <div className="setup-error">{error}</div>}

                <form onSubmit={handleSubmit} className="setup-form">
                    {/* Logo upload */}
                    <div className="setup-field">
                        <label className="setup-label">Logo de la Empresa</label>
                        <div className="logo-upload-area">
                            {logoPreview ? (
                                <div className="logo-preview-container">
                                    <img src={logoPreview} alt="Logo preview" className="logo-preview-img" />
                                    <button type="button" className="logo-remove-btn" onClick={removeLogo}>✕</button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="logo-upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21,15 16,10 5,21" />
                                    </svg>
                                    <span>Subir Logo</span>
                                    <span className="logo-upload-hint">PNG, JPG · Máx 2MB</span>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="setup-field">
                        <label className="setup-label">
                            Nombre del Negocio <span className="setup-required">*</span>
                        </label>
                        <input
                            type="text"
                            className="setup-input"
                            placeholder="Mi Empresa S.A.S"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="setup-field">
                        <label className="setup-label">NIT / RUT</label>
                        <input
                            type="text"
                            className="setup-input"
                            placeholder="900.123.456-7"
                            value={form.tax_id}
                            onChange={e => handleChange('tax_id', e.target.value)}
                        />
                    </div>

                    <div className="setup-field">
                        <label className="setup-label">Dirección</label>
                        <input
                            type="text"
                            className="setup-input"
                            placeholder="Calle 100 # 15-20, Bogotá"
                            value={form.address}
                            onChange={e => handleChange('address', e.target.value)}
                        />
                    </div>

                    <div className="setup-field-row">
                        <div className="setup-field">
                            <label className="setup-label">Teléfono</label>
                            <input
                                type="tel"
                                className="setup-input"
                                placeholder="+57 301 234 5678"
                                value={form.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                            />
                        </div>
                        <div className="setup-field">
                            <label className="setup-label">Email de Facturación</label>
                            <input
                                type="email"
                                className="setup-input"
                                placeholder="facturacion@empresa.com"
                                value={form.email}
                                onChange={e => handleChange('email', e.target.value)}
                            />
                        </div>
                    </div>

                    {user?.app_metadata?.provider === 'google' && (
                        <div className="setup-field" style={{ 
                            backgroundColor: 'rgba(13, 148, 136, 0.05)', 
                            padding: '1.5rem', 
                            borderRadius: '12px',
                            border: '1px dashed #0d9488',
                            marginBottom: '1.5rem'
                        }}>
                            <label className="setup-label" style={{ color: '#0d9488', fontWeight: 'bold' }}>
                                🔑 Contraseña para App Móvil <span className="setup-required">*</span>
                            </label>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                Como entraste con Google, necesitas crear una contraseña para poder iniciar sesión en tu celular.
                            </p>
                            <input
                                type="password"
                                className="setup-input"
                                placeholder="Mínimo 6 caracteres"
                                value={form.password}
                                onChange={e => handleChange('password', e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="setup-submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: 20, height: 20 }}></div>
                        ) : (
                            <>🚀 Comenzar a Facturar</>
                        )}
                    </button>
                </form>

                <p className="setup-note">
                    Podrás modificar estos datos más tarde en Configuración.
                </p>
            </div>
        </div>
    )
}
