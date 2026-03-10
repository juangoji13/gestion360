import React from 'react'

export default function ClientFormModal({
    isOpen,
    onClose,
    editing,
    form,
    setFieldValue,
    onSubmit,
    saving
}) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: editing ? '900px' : '500px', width: '90%' }}>
                <div className="modal-header">
                    <h3 className="modal-title">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
                    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Nombre / Razón Social *</label>
                            <input
                                className="form-input"
                                value={form.name}
                                onChange={e => setFieldValue('name', e.target.value)}
                                required
                                placeholder="Ej. Empresa SA"
                                autoFocus
                            />
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={form.email}
                                    onChange={e => setFieldValue('email', e.target.value)}
                                    placeholder="contacto@empresa.com"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono</label>
                                <input
                                    className="form-input"
                                    value={form.phone}
                                    onChange={e => setFieldValue('phone', e.target.value)}
                                    placeholder="300 000 0000"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">NIT / Documento</label>
                            <input
                                className="form-input"
                                value={form.tax_id}
                                onChange={e => setFieldValue('tax_id', e.target.value)}
                                placeholder="900.123.456-7"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Dirección</label>
                            <textarea
                                className="form-textarea"
                                value={form.address}
                                onChange={e => setFieldValue('address', e.target.value)}
                                placeholder="Dirección física o de facturación"
                                rows={2}
                            />
                        </div>
                        <div style={{ paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="client-create-btn" disabled={saving}>
                                {saving ? <div className="spinner" style={{ borderColor: '#fff', borderTopColor: 'transparent' }}></div> : (editing ? 'Guardar Cambios' : 'Crear Cliente')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
