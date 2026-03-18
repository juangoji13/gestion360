import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function InvoiceTotalsSidebar({
    totals,
    showTax, setShowTax,
    taxRate, setTaxRate,
    showDiscount, setShowDiscount,
    discountAmount, setDiscountAmount,
    discountType, setDiscountType,
    amountPaid, setAmountPaid,
    saving, onSave, onPreview
}) {
    return (
        <div className="cinv-totals-box sticky-sidebar">
            <h3 className="cinv-sidebar-title">RESUMEN DE TOTALES</h3>

            <div className="space-y-6">
                <div className="cinv-total-row" style={{ marginBottom: '1.5rem' }}>
                    <span style={{ color: '#94a3b8' }}>Subtotal Items:</span>
                    <span style={{ fontWeight: 700 }}>{formatCurrency(totals.subtotal)}</span>
                </div>

                <hr className="cinv-hr" />

                <div className="cinv-switch-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Aplicar Descuento</span>
                    </div>
                    <label className="cinv-switch">
                        <input type="checkbox" checked={showDiscount} onChange={e => setShowDiscount(e.target.checked)} />
                        <span className="cinv-switch-slider"></span>
                    </label>
                </div>

                {showDiscount && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                             <button 
                                className={`btn-type-toggle ${discountType === 'fixed' ? 'active' : ''}`}
                                onClick={() => setDiscountType('fixed')}
                             >
                                 $ Fijo
                             </button>
                             <button 
                                className={`btn-type-toggle ${discountType === 'percentage' ? 'active' : ''}`}
                                onClick={() => setDiscountType('percentage')}
                             >
                                 % Porc.
                             </button>
                        </div>
                        <label className="sidebar-label">Monto Descuento ({discountType === 'fixed' ? '$' : '%'})</label>
                        <input
                            type="number"
                            className="cinv-input-mini"
                            value={discountAmount}
                            onChange={e => setDiscountAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="any"
                        />
                    </div>
                )}

                <div className="cinv-switch-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>Cobrar IVA</span>
                    </div>
                    <label className="cinv-switch">
                        <input type="checkbox" checked={showTax} onChange={e => setShowTax(e.target.checked)} />
                        <span className="cinv-switch-slider"></span>
                    </label>
                </div>

                {showTax && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label className="sidebar-label">Porcentaje IVA (%)</label>
                        <input
                            type="number"
                            className="cinv-input-mini"
                            value={taxRate}
                            onChange={e => setTaxRate(e.target.value)}
                            placeholder="19"
                            min="0"
                            max="100"
                            step="any"
                        />
                    </div>
                )}

                {showTax && (
                    <div className="cinv-total-row" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        <span style={{ color: '#94a3b8' }}>Monto IVA:</span>
                        <span style={{ fontWeight: 700 }}>{formatCurrency(totals.tax)}</span>
                    </div>
                )}

                <hr className="cinv-hr" />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>Total Neto</span>
                    <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{formatCurrency(totals.taxable)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>TOTAL:</span>
                    <span style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--accent-primary)' }}>{formatCurrency(totals.total)}</span>
                </div>

                <hr className="cinv-hr" />

                <div style={{ marginBottom: '1.25rem' }}>
                    <label className="sidebar-label">¿Cuánto pagó el cliente? (Abono)</label>
                    <input
                        type="number"
                        className="cinv-input-mini"
                        value={amountPaid}
                        onChange={e => setAmountPaid(e.target.value)}
                        placeholder="0.00"
                        style={{ border: '2px solid #334155' }}
                        min="0"
                        step="any"
                    />
                </div>

                <div className="cinv-total-row" style={{ fontSize: '0.9rem', color: totals.balance > 0 ? '#ef4444' : '#10b981' }}>
                    <span>Saldo Pendiente:</span>
                    <span style={{ fontWeight: 800 }}>{formatCurrency(totals.balance)}</span>
                </div>
            </div>

            <div className="cinv-sidebar-actions" style={{ marginTop: '2rem' }}>
                <button className="cinv-btn cinv-btn-primary full-width" onClick={onSave} disabled={saving}>
                    {saving ? 'Guardando...' : 'Emitir Factura'}
                </button>
                <button className="cinv-btn cinv-btn-secondary full-width" onClick={onPreview}>
                    Vista Previa
                </button>
            </div>

            <style jsx="true">{`
                .sidebar-label {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--accent-primary);
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .cinv-input-mini {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.5);
                    border: 1px solid #1e293b;
                    border-radius: 8px;
                    padding: 10px;
                    color: #fff;
                    font-weight: 700;
                }
                .btn-type-toggle {
                    flex: 1;
                    padding: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 6px;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-type-toggle.active {
                    background: var(--accent-primary);
                    color: #fff;
                    border-color: var(--accent-primary);
                }
            `}</style>
        </div>
    );
}
