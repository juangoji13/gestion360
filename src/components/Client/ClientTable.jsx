import React from 'react'
import { Eye, Pencil, Trash2, FileText } from 'lucide-react'

export default function ClientTable({ clients, onOpenView, onOpenEdit, onDelete, onDownloadPDF }) {
    return (
        <div className="client-table-wrapper">
            <table className="client-table">
                <thead>
                    <tr>
                        <th>Cliente / Contacto</th>
                        <th>Identificación (NIT/CC)</th>
                        <th>Teléfono</th>
                        <th>Dirección</th>
                        <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                                <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
                                    <svg style={{ margin: '0 auto', width: '40px', height: '40px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p style={{ color: '#475569', fontWeight: 500 }}>
                                    No se encontraron clientes
                                </p>
                            </td>
                        </tr>
                    ) : (
                        clients.map((client) => (
                            <tr
                                key={client.id}
                                onClick={() => onOpenView(client)}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)'}
                                onMouseLeave={e => e.currentTarget.style.background = ''}
                            >
                                <td>
                                    <div className="client-info">
                                        <div className="client-avatar">
                                            {client.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="client-name">{client.name}</div>
                                            <div className="client-email">{client.email || 'Sin correo asociado'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="client-doc">{client.tax_id || '-'}</td>
                                <td className="client-phone">{client.phone || '-'}</td>
                                <td className="client-address" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {client.address || '-'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDownloadPDF(client) }}
                                            style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: '#1a56db', cursor: 'pointer', padding: '2px' }}
                                            title="Descargar Reporte PDF"
                                        >
                                            <FileText size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onOpenView(client) }}
                                            style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                                            title="Ver Dashboard"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onOpenEdit(client) }}
                                            style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: '#0284c7', cursor: 'pointer', padding: '2px' }}
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(client) }}
                                            style={{ display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
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
