import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalCount, pageSize, onPageChange }) {
    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Mostrando <strong>{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</strong> a <strong>{Math.min(currentPage * pageSize, totalCount)}</strong> de <strong>{totalCount}</strong> registros
            </div>
            <div className="pagination-controls">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-nav-btn"
                >
                    <ChevronLeft size={18} />
                </button>

                {renderPageNumbers()}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-nav-btn"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            <style jsx="true">{`
                .pagination-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    background: #fff;
                    border-top: 1px solid #e2e8f0;
                    font-size: 0.875rem;
                    color: #64748b;
                }
                .pagination-controls {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                .pagination-btn {
                    min-width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    background: transparent;
                    color: #64748b;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pagination-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
                .pagination-btn.active {
                    background: var(--accent-primary, #0d9488);
                    color: #fff;
                    border-color: var(--accent-primary, #0d9488);
                }
                .pagination-nav-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    background: transparent;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .pagination-nav-btn:hover:not(:disabled) {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                }
                .pagination-nav-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                @media (max-width: 640px) {
                    .pagination-container {
                        flex-direction: column;
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}
