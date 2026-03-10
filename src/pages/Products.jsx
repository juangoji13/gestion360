import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../hooks/useProducts'
import { useProductForm } from '../hooks/useProductForm'
import Pagination from '../components/Pagination'
import ConfirmModal from '../components/ConfirmModal'
import ProductTable from '../components/Product/ProductTable'
import ProductFormModal from '../components/Product/ProductFormModal'
import ProductStatsWidget from '../components/Product/ProductStatsWidget'
import { FileText } from 'lucide-react'
import { ReportService } from '../services/ReportService'
import { invoiceService } from '../services/invoiceService'
import DateRangeModal from '../components/DateRangeModal'
import './Products.css'

export default function Products() {
    const { business } = useAuth()

    // Logic for list, search and pagination
    const {
        products, loading, search, setSearch,
        page, setPage, totalCount, pageSize,
        allProductsMetrics, topProducts,
        loadProducts, deleteProduct: executeDeleteAction
    } = useProducts(business?.id)

    // Logic for create/edit form
    const {
        showModal, setShowModal, saving, editing, form,
        openCreate, openEdit, setFieldValue, handleSubmit
    } = useProductForm(business?.id, loadProducts)

    // Delete confirmation state
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [showDateModal, setShowDateModal] = useState(false)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    useEffect(() => {
        if (!loading) setIsInitialLoad(false)
    }, [loading])

    const handleDelete = (product) => {
        setConfirmDelete(product)
    }

    const confirmDeleteProduct = async () => {
        if (!confirmDelete) return
        const success = await executeDeleteAction(confirmDelete.id)
        if (success) setConfirmDelete(null)
    }

    const handleDownloadReport = async (period) => {
        try {
            // Para el reporte de productos necesitamos las facturas del periodo para calcular ventas
            const { data: allInvoices } = await invoiceService.getAll(business.id, { pageSize: 1000 })

            const filteredInvoices = allInvoices.filter(inv => {
                const date = new Date(inv.date || inv.created_at).toISOString().split('T')[0]
                return date >= period.from && date <= period.to
            })

            ReportService.generateProductReport(business, allProductsMetrics, filteredInvoices, period)
            setShowDateModal(false)
        } catch (error) {
            console.error('Error generando reporte:', error)
        }
    }

    // Calculate metrics for the widget
    const stats = {
        total_investment: allProductsMetrics.reduce((sum, p) => sum + (p.base_price || 0) * (p.stock || 0), 0),
        total_potential_value: allProductsMetrics.reduce((sum, p) => sum + (p.sale_price || 0) * (p.stock || 0), 0),
    }
    stats.total_margin = stats.total_potential_value - stats.total_investment
    stats.profit_margin = stats.total_potential_value > 0 ? (stats.total_margin / stats.total_potential_value) * 100 : 0

    if (isInitialLoad && loading) {
        return (
            <div className="loading-screen">
                <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
            </div>
        )
    }

    return (
        <div className="prod-container">
            <div className="prod-main-layout">
                <main className="prod-main">
                    <div className="prod-header">
                        <div>
                            <h1 className="prod-title">Gestión de Productos</h1>
                            <p className="prod-subtitle">Administre su catálogo de productos, precios y unidades.</p>
                        </div>
                        <div className="prod-header-actions">
                            <div className="prod-search">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    className="prod-search-input"
                                    type="text"
                                    placeholder="Buscar por SKU o Nombre"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="prod-actions-row">
                                <button className="btn-premium-primary" onClick={openCreate}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Nuevo Producto</span>
                                </button>
                                <button
                                    className="btn-premium-secondary"
                                    onClick={() => setShowDateModal(true)}
                                >
                                    <FileText size={20} strokeWidth={2.5} />
                                    <span>Reporte PDF</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="prod-table-card">
                        <ProductTable
                            products={products}
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

                <ProductStatsWidget
                    stats={stats}
                    topProducts={topProducts}
                />
            </div>

            <ProductFormModal
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
                title="Eliminar Producto"
                message={`¿Estás seguro de que deseas eliminar permanentemente el producto "${confirmDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                onConfirm={confirmDeleteProduct}
            />

            <DateRangeModal
                isOpen={showDateModal}
                onClose={() => setShowDateModal(false)}
                onConfirm={handleDownloadReport}
                title="Reporte de Artículos / Ventas"
            />
        </div>
    )
}
