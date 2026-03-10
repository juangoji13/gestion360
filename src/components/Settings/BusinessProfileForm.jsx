import React from 'react'

export default function BusinessProfileForm({
    form,
    setForm,
    isEditing,
    uploadingLogo,
    handleLogoUpload,
    fileInputRef
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {/* Hero Profile Table Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: 100,
                        height: 100,
                        borderRadius: '30px',
                        background: form.logo_url ? `url(${form.logo_url}) center/cover` : 'url(/logo.png) center/cover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        boxShadow: 'var(--shadow-lg)',
                        border: '4px solid white',
                    }}>
                        {!form.logo_url && (form.name || 'E')[0].toUpperCase()}
                    </div>
                    {isEditing && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleLogoUpload}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingLogo}
                                style={{
                                    position: 'absolute',
                                    bottom: -5,
                                    right: -5,
                                    width: 36,
                                    height: 36,
                                    borderRadius: '12px',
                                    background: 'white',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    cursor: uploadingLogo ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: 'var(--shadow-md)',
                                    zIndex: 2,
                                    fontSize: '1rem'
                                }}
                                title="Subir logo"
                            >
                                {uploadingLogo ? '⏳' : '📷'}
                            </button>
                        </>
                    )}
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Perfil del Negocio</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {isEditing ? 'Haga clic en el lápiz para cambiar la imagen de perfil' : 'Información corporativa base del sistema'}
                    </p>
                </div>
            </div>

            <div className="form-grid" style={{ pointerEvents: isEditing ? 'auto' : 'none', opacity: isEditing ? 1 : 0.7 }}>
                <div className="form-group full-width">
                    <label className="form-label">Nombre del Negocio *</label>
                    <input
                        className="form-input"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="Mi Empresa S.A.S"
                        readOnly={!isEditing}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">NIT / RUC / RUT</label>
                    <input
                        className="form-input"
                        value={form.tax_id}
                        onChange={e => setForm({ ...form, tax_id: e.target.value })}
                        placeholder="900.123.456-7"
                        readOnly={!isEditing}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                        className="form-input"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="+57 300 123 4567"
                        readOnly={!isEditing}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Correo Electrónico</label>
                    <input
                        type="email"
                        className="form-input"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="info@miempresa.com"
                        readOnly={!isEditing}
                    />
                </div>
                <div className="form-group full-width">
                    <label className="form-label">Dirección</label>
                    <input
                        className="form-input"
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        placeholder="Calle 123 # 45-67, Ciudad"
                        readOnly={!isEditing}
                    />
                </div>
            </div>
        </div>
    )
}
