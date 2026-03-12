import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { invoiceService } from '../services/invoiceService'
import { productService } from '../services/productService'
import { useClients } from '../hooks/useClients'
import { useClientForm } from '../hooks/useClientForm'
import Pagination from '../components/common/Pagination'
import ConfirmModal from '../components/common/ConfirmModal'
import ClientTable from '../components/Client/ClientTable'
import ClientFormModal from '../components/Client/ClientFormModal'
import ClientDetailModal from '../components/Client/ClientDetailModal'
import ClientStatsWidget from '../components/Client/ClientStatsWidget'
import PaymentModal from '../components/Invoice/PaymentModal'
import './Clients.css'

export default function Clients() {
    const { business } = useAuth()
    const toast = useToast()
    const navigate = useNavigate()

    // Logic for list, search and pagination
    const {
        clients, loading, search, setSearch,
        page, setPage, totalCount, pageSize,
        loadClients, deleteClient: executeDeleteAction
    } = useClients(business?.id)

    // Logic for create/edit form
    const {
        showModal, setShowModal, saving, editing, form,
        openCreate, openEdit, setFieldValue, handleSubmit
    } = useClientForm(business?.id, loadClients)

    // State for View Detail and Delete Confirmation
    const [viewClient, setViewClient] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)

    // Global data for stats in detail modal (keep original behavior for now)
    const [invoices, setInvoices] = useState([])
    const [products, setProducts] = useState([])

    // Payment State
    const [paymentInvoice, setPaymentInvoice] = useState(null)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    useEffect(() => {
        if (!loading) setIsInitialLoad(false)
    }, [loading])

    useEffect(() => {
        if (business) {
            // Load some extra data for the detail dashboard stats
            invoiceService.getAll(business.id, { pageSize: 1000 }).then(r => setInvoices(r.data || []))
            productService.getAll(business.id, { pageSize: 1000 }).then(r => setProducts(r.data || []))
        }
    }, [business])

    const handleDelete = (client) => {
        setConfirmDelete(client)
    }

    const confirmDeleteClient = async () => {
        if (!confirmDelete) return
        const success = await executeDeleteAction(confirmDelete.id)
        if (success) setConfirmDelete(null)
    }

    const handleStatusChange = async (invoiceId, newStatus) => {
        try {
            await invoiceService.updateStatus(invoiceId, newStatus)
            const r = await invoiceService.getAll(business.id, { pageSize: 1000 })
            setInvoices(r.data || [])
            toast.success('Estado actualizado')
        } catch (err) {
            toast.error('Error al actualizar estado')
        }
    }

    const handlePaymentSubmit = async (invoiceId, currentPaid, paymentAmount, totalAmount) => {
        try {
            await invoiceService.addPayment(invoiceId, currentPaid, paymentAmount, totalAmount)
            toast.success('Abono registrado correctamente')
            setPaymentInvoice(null)

            // Reload global invoices to reflect on dashboard
            const r = await invoiceService.getAll(business.id, { pageSize: 1000 })
            setInvoices(r.data || [])
        } catch (error) {
            console.error('Error registering payment:', error)
            toast.error('Error al registrar abono')
        }
    }

    if (isInitialLoad && loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
            </div>
        )
    }

    return (
        <div className="client-container">
            <div className="client-main-layout">
                <main className="client-main">
                    <div className="client-header">
                        <div>
                            <h1 className="client-title">Gestión de Clientes</h1>
                            <p className="client-subtitle">Administre su base de clientes, contactos e información fiscal.</p>
                        </div>
                        <div className="client-header-actions">
                            <div className="client-search">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Buscar por Nombre, Email o NIT"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <button className="client-create-btn" onClick={openCreate}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Nuevo Cliente
                            </button>
                        </div>
                    </div>

                    <div className="client-table-card">
                        <ClientTable
                            clients={clients}
                            onOpenView={setViewClient}
                            onOpenEdit={openEdit}
                            onDelete={handleDelete}
                        />

                        <Pagination
                            currentPage={page}
                            totalCount={totalCount}
                            pageSize={pageSize}
                            onPageChange={setPage}
                        />
                    </div>
                </main>

                <ClientStatsWidget totalClients={totalCount} />
            </div>

            <ClientDetailModal
                client={viewClient}
                onClose={() => setViewClient(null)}
                onEdit={openEdit}
                onNavigateInvoice={(id) => { setViewClient(null); navigate(`/invoices/${id}`) }}
                onStatusChange={handleStatusChange}
                onAddPayment={(inv) => setPaymentInvoice(inv)}
                invoices={invoices}
                products={products}
            />

            <PaymentModal
                isOpen={!!paymentInvoice}
                onClose={() => setPaymentInvoice(null)}
                onSubmit={handlePaymentSubmit}
                invoice={paymentInvoice}
            />

            <ClientFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                editing={editing}
                form={form}
                setFieldValue={setFieldValue}
                onSubmit={handleSubmit}
                saving={saving}
            />

            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                title="Eliminar Cliente"
                message={`¿Estás seguro de que deseas eliminar permanentemente a "${confirmDelete?.name}"? Esta acción borrará al cliente de tu base de datos.`}
                confirmText="Sí, Eliminar"
                onConfirm={confirmDeleteClient}
            />
        </div>
    )
}
