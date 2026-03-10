import React, { useState, useRef, useEffect } from 'react';
import './SearchableSelect.css';

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Seleccionar...",
    className = "",
    required = false
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option.id);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className={`ss-container ${className} ${isOpen ? 'is-open' : ''}`} ref={containerRef}>
            <div
                className={`ss-trigger ${isOpen ? 'active' : ''} ${!selectedOption ? 'placeholder' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="ss-value">
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <svg className={`ss-arrow ${isOpen ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>

            {isOpen && (
                <div className="ss-dropdown">
                    <div className="ss-search-container">
                        <svg className="ss-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="ss-search-input"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="ss-options-list">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    key={option.id}
                                    className={`ss-option ${option.id === value ? 'selected' : ''}`}
                                    onClick={() => handleSelect(option)}
                                >
                                    {option.name}
                                    {option.id === value && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="ss-no-results">No se encontraron resultados</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
