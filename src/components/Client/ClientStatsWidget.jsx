import React from 'react'

export default function ClientStatsWidget({ totalClients }) {
    return (
        <aside className="client-aside">
            {/* Stats Widget */}
            <div className="client-stats-card">
                <div className="client-stats-bg-icon">
                    <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h3 className="client-stats-label">Clientes Totales</h3>
                <div className="client-stats-value">{totalClients}</div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#e0f2fe', fontWeight: 500 }}>
                    <svg style={{ width: '16px', height: '16px', marginRight: '4px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>Clientes activos en el sistema</span>
                </div>
            </div>

            {/* Info Mock Widget */}
            <div className="client-aside-card">
                <div className="client-aside-header">
                    <h3 className="client-aside-title">Novedades</h3>
                </div>
                <div>
                    <div className="client-alert">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <div className="client-alert-title">Nuevo Cliente Registrado</div>
                            <div className="client-alert-text">Mantén el contacto enviándoles un saludo de bienvenida o su primera factura.</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
