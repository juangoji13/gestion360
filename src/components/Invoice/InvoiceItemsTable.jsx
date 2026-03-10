import React from 'react';
import { formatCurrency } from '../../utils/formatters';
import SearchableSelect from '../UI/SearchableSelect';

export default function InvoiceItemsTable({ items, products, updateItem, removeItem, addItem }) {
    return (
        <div className="cinv-section">
            <h2 className="cinv-section-title">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Productos y Servicios
            </h2>

            <div className="cinv-items-wrapper">
                <div className="cinv-grid-table">
                    <div className="cinv-grid-header">
                        <div>Producto</div>
                        <div>Descripción *</div>
                        <div style={{ textAlign: 'center' }}>Cant.</div>
                        <div style={{ whiteSpace: 'nowrap' }}>Precio Unit.</div>
                        <div style={{ textAlign: 'right' }}>Total</div>
                        <div style={{ textAlign: 'center' }}></div>
                    </div>
                    <div className="cinv-grid-body">
                        {items.length === 0 ? (
                            <div className="cinv-empty-row">
                                No hay items en la factura. Agrega el primero.
                            </div>
                        ) : (
                            items.map((item, index) => (
                                <div className="cinv-grid-row" key={index}>
                                    <div>
                                        <SearchableSelect
                                            options={products}
                                            value={item.product_id || ''}
                                            onChange={val => updateItem(index, 'product_id', val)}
                                            placeholder="Producto..."
                                            className="dense"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            placeholder="Ej. Servicio..."
                                            value={item.description}
                                            onChange={e => updateItem(index, 'description', e.target.value)}
                                            className="item-input"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={item.quantity}
                                            onChange={e => updateItem(index, 'quantity', e.target.value.replace(/[^0-9]/g, ''))}
                                            className="item-input text-center"
                                        />
                                    </div>
                                    <div>
                                        <div className="item-input price-input-container" style={{ padding: '0.5rem' }}>
                                            <span style={{ color: '#64748b' }}>$</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={item.unit_price}
                                                onChange={e => updateItem(index, 'unit_price', e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'))}
                                                className="item-price-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="item-total" style={{ padding: '0.5rem 0' }}>
                                        {formatCurrency(item.total)}
                                    </div>
                                    <div className="text-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <button className="cinv-icon-btn danger" onClick={() => removeItem(index)} type="button">
                                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <button className="cinv-add-btn" onClick={addItem} type="button">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Agregar Ítem
            </button>

            <style jsx="true">{`
                .item-input {
                    width: 100%;
                    padding: 0 0.75rem;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    background: transparent;
                    outline: none;
                    color: var(--text-primary);
                    font-size: 0.875rem;
                    font-weight: 500;
                    font-family: var(--font-family);
                    transition: all var(--transition-fast);
                    height: 38px;
                    min-height: 38px;
                }
                .item-input:hover {
                    background: rgba(241, 245, 249, 0.6);
                }
                .item-input:focus, .item-input:focus-within {
                    border-color: var(--accent-primary) !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.08) !important;
                }
                .price-input-container {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .item-price-input {
                    text-align: right;
                    font-weight: 500;
                    color: #0f172a;
                    border: none;
                    background: transparent;
                    outline: none;
                    width: 100%;
                    font-family: inherit;
                }
                .item-total {
                    text-align: right;
                    font-weight: 600;
                    color: #0f172a;
                    vertical-align: middle;
                }
                .text-center { text-align: center; }

                /* Premium Input Styling for SearchableSelect inside grid row */
                .cinv-grid-row .ss-trigger {
                    border: 1px solid transparent !important;
                    background: transparent !important;
                    box-shadow: none !important;
                    height: 38px !important;
                    min-height: 38px !important;
                    transition: all var(--transition-fast);
                }
                .cinv-grid-row .ss-trigger:hover {
                    background: rgba(241, 245, 249, 0.6) !important;
                }
                .cinv-grid-row .ss-trigger.active {
                    border-color: var(--accent-primary) !important;
                    background: #fff !important;
                    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.08) !important;
                }
            `}</style>
        </div>
    );
}
