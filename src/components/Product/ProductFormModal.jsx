import React from 'react'

export default function ProductFormModal({
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
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Nombre *</label>
                                <input
                                    className="form-input"
                                    value={form.name}
                                    onChange={e => setFieldValue('name', e.target.value)}
                                    required
                                    placeholder="Nombre del producto"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">SKU</label>
                                <input
                                    className="form-input"
                                    value={form.sku}
                                    onChange={e => setFieldValue('sku', e.target.value)}
                                    placeholder="PRD-001"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Descripción</label>
                            <textarea
                                className="form-textarea"
                                value={form.description}
                                onChange={e => setFieldValue('description', e.target.value)}
                                placeholder="Descripción del producto o servicio"
                                rows={2}
                            />
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Precio Base (Compra) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    className="form-input"
                                    value={form.base_price}
                                    onChange={e => setFieldValue('base_price', e.target.value)}
                                    required
                                    placeholder="A como lo compras"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Precio Venta *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    className="form-input"
                                    value={form.sale_price}
                                    onChange={e => setFieldValue('sale_price', e.target.value)}
                                    required
                                    placeholder="A como lo vendes"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">📦 Cantidad en Inventario</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                className="form-input"
                                value={form.stock}
                                onChange={e => setFieldValue('stock', e.target.value)}
                                placeholder="Ej. 50"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Unidad de Medida</label>
                            <input
                                list="unidades-list"
                                className="form-input"
                                value={form.unit}
                                onChange={e => setFieldValue('unit', e.target.value)}
                                placeholder="Ej. gramos, cajas, frascos..."
                                style={{ backgroundColor: '#fff' }}
                            />
                            <datalist id="unidades-list">
                                <option value="und">Unidades (und)</option>
                                <option value="kg">Kilogramos</option>
                                <option value="g">Gramos</option>
                                <option value="l">Litros</option>
                                <option value="ml">Mililitros</option>
                                <option value="m">Metros</option>
                                <option value="cm">Centímetros</option>
                            </datalist>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="prod-create-btn" disabled={saving}>
                            {saving ? <div className="spinner" style={{ borderColor: '#fff', borderTopColor: 'transparent' }}></div> : (editing ? 'Guardar Cambios' : 'Crear Producto')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
