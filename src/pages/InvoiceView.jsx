import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { invoiceService } from '../services/invoiceService'
import { Trash2 } from 'lucide-react'
import ConfirmModal from '../components/common/ConfirmModal'
import InvoiceTemplate from '../components/Invoice/InvoiceTemplate'

export default function InvoiceView() {
    const { id } = useParams()
    const { business } = useAuth()
    const toast = useToast()
    const navigate = useNavigate()
    const [invoice, setInvoice] = useState(null)
    const [loading, setLoading] = useState(true)
    const [confirmDelete, setConfirmDelete] = useState(false)

    useEffect(() => {
        loadInvoice()
    }, [id])

    const loadInvoice = async () => {
        try {
            const data = await invoiceService.getById(id)
            setInvoice(data)
        } catch (err) {
            toast.error('Error al cargar factura')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="page">
                <div className="empty-state">
                    <div className="empty-state-icon">❌</div>
                    <div className="empty-state-title">Factura no encontrada</div>
                    <Link to="/invoices" className="btn btn-primary">← Volver a Facturas</Link>
                </div>
            </div>
        )
    }

    const items = (invoice.invoice_items || []).map(item => ({
        ...item,
        description: item.description || item.product?.name || '-',
    }))

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Factura {invoice.invoice_number}</h1>
                    <p className="page-subtitle">
                        <span className={`badge ${invoice.status === 'paid' ? 'badge-success' :
                            invoice.status === 'pending' ? 'badge-warning' :
                                'badge-danger'
                            }`}>
                            {invoice.status === 'paid' ? 'Pagada' :
                                invoice.status === 'pending' ? 'Pendiente' :
                                    invoice.status}
                        </span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="btn btn-secondary"
                        style={{ color: '#ef4444' }}
                    >
                        <Trash2 size={16} style={{ marginBottom: '-2px' }} /> Eliminar
                    </button>
                    <Link to="/invoices" className="btn btn-secondary">← Volver</Link>
                </div>
            </div>

            <InvoiceTemplate
                business={business}
                client={invoice.client}
                invoiceNumber={invoice.invoice_number}
                invoiceDate={invoice.date}
                dueDate={invoice.due_date}
                items={items}
                subtotal={invoice.subtotal}
                taxRate={invoice.tax_rate}
                taxAmount={invoice.tax_amount}
                discountAmount={invoice.discount_amount}
                total={invoice.total}
                notes={invoice.notes}
            />

            <ConfirmModal
                isOpen={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                title="Eliminar Factura"
                message={`¿Estás seguro de que deseas eliminar permanentemente la factura ${invoice.invoice_number}?`}
                confirmText="Eliminar"
                onConfirm={async () => {
                    try {
                        await invoiceService.delete(id)
                        toast.success('Factura eliminada')
                        navigate('/invoices')
                    } catch (e) { toast.error('Error al eliminar') }
                }}
            />
        </div>
    )
}
