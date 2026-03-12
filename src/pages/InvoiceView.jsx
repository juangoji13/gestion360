import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { invoiceService } from '../services/invoiceService'
import { Trash2, Pencil, Share2, ArrowLeft } from 'lucide-react'
import ConfirmModal from '../components/common/ConfirmModal'
import InvoiceTemplate from '../components/Invoice/InvoiceTemplate'
import './InvoiceView.css'

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
            <div className="invoice-view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }}></div>
            </div>
        )
    }

    if (!invoice) {
        return (
            <div className="invoice-view-container">
                <div className="empty-state" style={{ padding: '100px 20px', color: '#f8fafc', textAlign: 'center' }}>
                    <div className="empty-state-icon" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>❌</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Factura no encontrada</h2>
                    <Link to="/invoices" className="btn-premium btn-premium-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                        <ArrowLeft size={18} /> Volver a Facturas
                    </Link>
                </div>
            </div>
        )
    }

    const items = (invoice.invoice_items || []).map(item => ({
        ...item,
        description: item.description || item.product?.name || '-',
    }))

    const isPaid = invoice.status === 'paid'

    return (
        <div className="invoice-view-container">
            <header className="invoice-view-header">
                <div className="header-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/invoices" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>
                            <ArrowLeft size={24} />
                        </Link>
                        <h1>Factura {invoice.invoice_number}</h1>
                    </div>
                    <div className="status-badge">
                        <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '20px' }}>
                            {isPaid ? 'Pagada' : 'Pendiente'}
                        </span>
                    </div>
                </div>

                <div className="header-actions">
                    {!isPaid && (
                        <Link
                            to={`/invoices/edit/${id}`}
                            className="btn-premium btn-premium-primary"
                            style={{ textDecoration: 'none' }}
                        >
                            <Pencil size={18} /> Editar
                        </Link>
                    )}
                    
                    {isPaid && (
                        <button 
                            className="btn-premium btn-premium-primary"
                            onClick={() => {
                                const templateBtn = document.getElementById('btn-share-template');
                                if (templateBtn) templateBtn.click();
                            }}
                        >
                            <Share2 size={18} /> Compartir
                        </button>
                    )}

                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="btn-premium btn-premium-danger"
                    >
                        <Trash2 size={18} /> Eliminar
                    </button>
                </div>
            </header>

            <main className="invoice-preview-section">
                <div className="web-invoice-paper">
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
                        isPaid={isPaid}
                    />
                </div>
            </main>

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
