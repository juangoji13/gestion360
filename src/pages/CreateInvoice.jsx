import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useInvoiceForm } from '../hooks/useInvoiceForm'
import InvoiceTemplate from '../components/Invoice/InvoiceTemplate'
import InvoiceFormHeader from '../components/Invoice/InvoiceFormHeader'
import InvoiceItemsTable from '../components/Invoice/InvoiceItemsTable'
import InvoiceTotalsSidebar from '../components/Invoice/InvoiceTotalsSidebar'
import InvoiceClientStatus from '../components/Invoice/InvoiceClientStatus'
import InvoiceNotes from '../components/Invoice/InvoiceNotes'
import './CreateInvoice.css'

export default function CreateInvoice() {
    const { id } = useParams()
    const { business } = useAuth()
    const toast = useToast()
    const [showPreview, setShowPreview] = useState(false)

    const {
        clients, products, loading, saving,
        selectedClient, setSelectedClient,
        invoiceNumber, setInvoiceNumber,
        invoiceDate, setInvoiceDate,
        notes, setNotes,
        items, addItem, updateItem, removeItem,
        clientBalance,
        taxRate, setTaxRate,
        discountAmount, setDiscountAmount,
        showTax, setShowTax,
        showDiscount, setShowDiscount,
        totals,
        saveInvoice,
        clearDraft,
        isEditing,
        hasDraft
    } = useInvoiceForm(business, id)

    const handleSave = async () => {
        try {
            const result = await saveInvoice()
            toast.success(isEditing ? 'Factura actualizada exitosamente' : 'Factura creada exitosamente')
            window.location.href = `/invoices/${result.id}`
        } catch (err) {
            toast.error(err.message || 'Error al guardar factura')
        }
    }

    const getClientData = () => clients.find(c => c.id === selectedClient)

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
            </div>
        )
    }

    if (showPreview) {
        return (
            <div className="cinv-container">
                <div className="cinv-header">
                    <div>
                        <h1 className="cinv-title">Vista Previa</h1>
                        <p className="cinv-subtitle">Así es como tu cliente verá la factura</p>
                    </div>
                    <div className="cinv-actions">
                        <button className="cinv-btn cinv-btn-secondary" onClick={() => setShowPreview(false)}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            Volver a Editar
                        </button>
                        <button className="cinv-btn cinv-btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <div className="spinner" style={{ borderColor: '#fff', borderTopColor: 'transparent', width: '20px', height: '20px', borderWidth: '2px' }}></div> : (
                                <>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    Guardar Factura
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <InvoiceTemplate
                        business={business}
                        client={getClientData()}
                        invoiceNumber={invoiceNumber}
                        invoiceDate={invoiceDate}
                        items={items}
                        subtotal={totals.subtotal}
                        taxRate={showTax ? taxRate : 0}
                        taxAmount={totals.tax}
                        discountAmount={showDiscount ? discountAmount : 0}
                        total={totals.total}
                        notes={notes}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="cinv-container">
            <Link to="/invoices" className="cinv-back-btn" style={{ marginBottom: '1.5rem' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Volver a Facturas
            </Link>

            <div className="cinv-header">
                <div>
                    <h1 className="cinv-title">{isEditing ? 'Editar Factura' : 'Crear Factura'}</h1>
                    <p className="cinv-subtitle">
                        {isEditing ? `Modificando la factura ${invoiceNumber}` : 'Complete los campos para generar un nuevo comprobante'}
                    </p>
                </div>
                {hasDraft && (
                    <button
                        className="cinv-btn cinv-btn-secondary"
                        onClick={clearDraft}
                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" style={{ marginRight: '6px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Descartar Borrador
                    </button>
                )}
            </div>

            <div className="cinv-card">
                <InvoiceFormHeader
                    selectedClient={selectedClient}
                    setSelectedClient={setSelectedClient}
                    invoiceNumber={invoiceNumber}
                    setInvoiceNumber={setInvoiceNumber}
                    invoiceDate={invoiceDate}
                    setInvoiceDate={setInvoiceDate}
                    clients={clients}
                />

                <div className="cinv-main-layout">
                    <div className="cinv-main-content">
                        <InvoiceItemsTable
                            items={items}
                            products={products}
                            updateItem={updateItem}
                            removeItem={removeItem}
                            addItem={addItem}
                        />

                        <InvoiceNotes
                            notes={notes}
                            setNotes={setNotes}
                        />
                    </div>

                    <aside className="cinv-sidebar">
                        <InvoiceTotalsSidebar
                            totals={totals}
                            showTax={showTax}
                            setShowTax={setShowTax}
                            taxRate={taxRate}
                            setTaxRate={setTaxRate}
                            showDiscount={showDiscount}
                            setShowDiscount={setShowDiscount}
                            discountAmount={discountAmount}
                            setDiscountAmount={setDiscountAmount}
                            saving={saving}
                            onSave={handleSave}
                            onPreview={() => setShowPreview(true)}
                        />

                        <InvoiceClientStatus
                            clientBalance={clientBalance}
                        />
                    </aside>
                </div>
            </div>
        </div >
    )
}
