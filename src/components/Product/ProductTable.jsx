import React from 'react'
import { Pencil, Trash2, Package, MoreVertical, Edit3, Trash } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export default function ProductTable({ products, onOpenEdit, onDelete }) {
    return (
        <div className="prod-table-wrapper">
            <table className="table">
                <thead>
                    <tr>
                        <th style={{ width: '100px' }}>SKU</th>
                        <th>NOMBRE DEL PRODUCTO / DESC</th>
                        <th style={{ width: '100px' }}>UNIDAD</th>
                        <th style={{ width: '180px' }}>ESTADO</th>
                        <th style={{ width: '140px', textAlign: 'right' }}>P. BASE (COMPRA)</th>
                        <th style={{ width: '140px', textAlign: 'right' }}>P. VENTA</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>ACCIONES</th>
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                                <div className="empty-state">
                                    <Package size={40} strokeWidth={1.5} className="empty-state-icon" />
                                    <p className="empty-state-title">No hay productos registrados</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product.id}>
                                <td className="text-muted" style={{ fontSize: '0.85rem' }}>{product.sku || '-'}</td>
                                <td>
                                    <div className="prod-item-text">
                                        <div className="prod-item-name" style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{product.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px', opacity: 0.8 }}>{product.description || 'Sin descripción'}</div>
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge-info" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: 'none' }}>
                                        {product.unit || 'UND'}
                                    </span>
                                </td>
                                <td>
                                    <div className={`pill-indicator ${product.stock <= 0 ? 'pill-indicator--danger' : product.stock < 5 ? 'pill-indicator--warning' : 'pill-indicator--success'}`}>
                                        <span className="dot"></span>
                                        {product.stock <= 0 ? 'Sin stock' : product.stock < 5 ? `Bajo Stock (${product.stock})` : `DISPONIBLE (${product.stock} ${product.unit || 'KG'})`}
                                    </div>
                                </td>
                                <td className="prod-price-cell base">
                                    {formatCurrency(product.base_price)}
                                </td>
                                <td className="prod-price-cell sale">
                                    {formatCurrency(product.sale_price)}
                                </td>
                                <td className="prod-actions-cell">
                                    <div className="prod-action-btns" style={{ gap: '6px' }}>
                                        <button
                                            className="prod-action-btn edit"
                                            onClick={() => onOpenEdit(product)}
                                            style={{ background: 'var(--bg-hover)', color: 'var(--accent-primary)', border: 'none', padding: '6px', borderRadius: '8px' }}
                                        >
                                            <Pencil size={16} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            className="prod-action-btn delete"
                                            onClick={() => onDelete(product)}
                                            style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--danger)', border: 'none', padding: '6px', borderRadius: '8px' }}
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
