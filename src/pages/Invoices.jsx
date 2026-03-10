import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useInvoices } from '../hooks/useInvoices'
import { formatCurrency } from '../utils/formatters'
import ConfirmModal from '../components/ConfirmModal'
import Pagination from '../components/Pagination'
import { FileText } from 'lucide-react'
import { ReportService } from '../services/ReportService'
import DateRangeModal from '../components/DateRangeModal'
import { invoiceService } from '../services/invoiceService'
import InvoiceTable from '../components/Invoice/InvoiceTable'
import PaymentModal from '../components/Invoice/PaymentModal'
import './Invoices.css'

export default function Invoices() {
    const { business } = useAuth()

    const {
        invoices,
        loading,
        filter,
        setFilter,
        search,
        setSearch,
        confirmDelete,
        setConfirmDelete,
        page,
        setPage,
        totalCount,
        pageSize,
        handleStatusChange,
        executeDelete,
        handleAddPayment,
        stats
    } = useInvoices(business)

    const [showDateModal, setShowDateModal] = useState(false)
    const [paymentInvoice, setPaymentInvoice] = useState(null)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    useEffect(() => {
        if (!loading) setIsInitialLoad(false)
    }, [loading])

    const handleGenerateReport = async (period) => {
        try {
            // Obtenemos todas las facturas del periodo (sin paginación para el reporte)
            const { data: allInvoices } = await invoiceService.getAll(business.id, { pageSize: 1000 })

            const filtered = allInvoices.filter(inv => {
                const date = new Date(inv.date || inv.created_at).toISOString().split('T')[0]
                return date >= period.from && date <= period.to
            })

            ReportService.generatePaymentReport(business, filtered, period)
            setShowDateModal(false)
        } catch (error) {
            console.error('Error generando reporte:', error)
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
        <div className="inv-container">
            <main className="inv-main">
                <div className="inv-header">
                    <div>
                        <h1 className="inv-title">Facturación</h1>
                        <p className="inv-subtitle">Gestiona tus facturas, cobros y estados de pago.</p>
                    </div>
                    <div className="inv-header-actions">
                        <div className="inv-search">
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar N° Factura o Cliente"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <Link to="/invoices/new" className="inv-create-btn" style={{ textDecoration: 'none' }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva Factura
                        </Link>
                        <button
                            className="inv-create-btn"
                            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                            onClick={() => setShowDateModal(true)}
                        >
                            <FileText size={20} />
                            Reporte PDF
                        </button>
                    </div>
                </div>

                <div className="inv-table-card">
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['all', 'pending', 'paid', 'overdue'].map(f => {
                            const labels = { all: 'Todas', pending: 'Pendientes', paid: 'Pagadas', overdue: 'Vencidas' };
                            const isActive = filter === f;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`filter-btn ${isActive ? 'active' : ''}`}
                                    style={{
                                        padding: '0.4rem 1rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        border: isActive ? 'none' : '1px solid #e2e8f0',
                                        background: isActive ? 'var(--accent-primary)' : 'transparent',
                                        color: isActive ? '#ffffff' : '#64748b',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: isActive ? '0 2px 8px rgba(13,148,136,0.3)' : 'none',
                                    }}
                                >
                                    {labels[f]}
                                </button>
                            );
                        })}
                    </div>

                    <InvoiceTable
                        invoices={invoices}
                        onStatusChange={handleStatusChange}
                        onDelete={setConfirmDelete}
                        onAddPayment={setPaymentInvoice}
                    />

                    <Pagination
                        currentPage={page}
                        totalCount={totalCount}
                        pageSize={pageSize}
                        onPageChange={setPage}
                    />
                </div>
            </main>

            {/* Right Aside */}
            <aside className="inv-aside">
                <div className="inv-stats-card">
                    <div className="inv-stats-bg-icon">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="inv-stats-label">Por Cobrar (Pendiente)</h3>
                    <div className="inv-stats-value">{formatCurrency(stats.totalPending)}</div>
                </div>
            </aside>

            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                title="Eliminar Factura"
                message={`¿Estás seguro de que deseas eliminar permanentemente la factura ${confirmDelete?.invoice_number}?`}
                confirmText="Eliminar"
                onConfirm={executeDelete}
            />

            <DateRangeModal
                isOpen={showDateModal}
                onClose={() => setShowDateModal(false)}
                onConfirm={handleGenerateReport}
                title="Reporte de Pagos / Caja"
            />

            {paymentInvoice && (
                <PaymentModal
                    invoice={paymentInvoice}
                    onClose={() => setPaymentInvoice(null)}
                    onSubmit={async (id, actualPaid, amount, total) => {
                        await handleAddPayment(id, actualPaid, amount, total)
                        setPaymentInvoice(null)
                    }}
                />
            )}
        </div>
    )
}
