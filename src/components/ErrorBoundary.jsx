import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#f8fafc'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                        Algo salió mal
                    </h1>
                    <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '1.5rem' }}>
                        La aplicación encontró un error inesperado. Por favor, intenta recargar la página.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'var(--accent-primary, #0d948a)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                    >
                        Recargar Aplicación
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre style={{
                            marginTop: '2rem',
                            padding: '1rem',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            textAlign: 'left',
                            maxWidth: '90%'
                        }}>
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
