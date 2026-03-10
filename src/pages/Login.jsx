import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import './Login.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(true)
    const [loading, setLoading] = useState(false)
    const [showForgot, setShowForgot] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')
    const [forgotLoading, setForgotLoading] = useState(false)
    const { signIn, signInWithGoogle } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await signIn(email, password, rememberMe)
            navigate('/')
        } catch (err) {
            toast.error(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        try {
            await signInWithGoogle()
            navigate('/')
        } catch (err) {
            toast.error(err.message || 'Error con Google')
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        if (!forgotEmail) { toast.error('Ingresa tu correo'); return }
        setForgotLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error
            toast.success('Revisa tu correo para restablecer tu contraseña')
            setShowForgot(false)
        } catch (err) {
            toast.error(err.message || 'Error al enviar el correo')
        } finally {
            setForgotLoading(false)
        }
    }

    return (
        <>
            <div className="login-page-container">
                {/* Left Side: Professional Illustration */}
                <div className="login-left-side">
                    <div className="login-bg-image" />
                    <div className="login-overlay" />

                    <div className="login-left-content">
                        <div className="login-welcome-text">
                            <h1>Control Total <br /><span>en 360 Grados</span></h1>
                            <p className="login-welcome-description">
                                Potencia tu negocio con nuestra plataforma integral de facturación, inventario y gestión de clientes.
                            </p>

                            <div className="login-stats">
                                <div className="login-stat-item">
                                    <div className="stat-val">100%</div>
                                    <div className="stat-lab">Cloud Based</div>
                                </div>
                                <div className="login-stats-divider" />
                                <div className="login-stat-item">
                                    <div className="stat-val">24/7</div>
                                    <div className="stat-lab">Soporte Vital</div>
                                </div>
                            </div>
                        </div>

                        <div className="login-credits-footer">
                            Desarrollado por <span className="dev-name">Juan Gonzalez</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="login-right-side">
                    <div className="login-form-wrapper">
                        <div className="login-brand-protagonist-right">
                            <img src="/logo.png" alt="Gestión360 Logo" />
                        </div>

                        <div className="login-form-header">
                            <h2>Iniciar Sesión</h2>
                            <p>Accede a tu panel.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="login-input-group">
                                <label className="login-label" htmlFor="email">Correo Electrónico</label>
                                <div className="login-input-wrapper">
                                    <span className="login-input-icon">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </span>
                                    <input
                                        className="login-input"
                                        id="email"
                                        type="email"
                                        placeholder="ejemplo@empresa.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label className="login-label" htmlFor="password">Contraseña</label>
                                    <button
                                        type="button"
                                        className="login-forgot-link"
                                        onClick={() => { setForgotEmail(email); setShowForgot(true) }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}
                                    >
                                        ¿Olvidó su contraseña?
                                    </button>
                                </div>
                                <div className="login-input-wrapper">
                                    <span className="login-input-icon">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </span>
                                    <input
                                        className="login-input"
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <label className="login-remember-me">
                                    <input
                                        className="login-checkbox"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                    />
                                    <span className="login-remember-text">Mantener sesión iniciada</span>
                                </label>
                            </div>

                            <button className="login-submit-btn" type="submit" disabled={loading}>
                                {loading ? <div className="login-spinner" /> : 'Entrar al Sistema'}
                            </button>

                            <div className="login-divider">
                                <span className="login-divider-text">O continúa con</span>
                            </div>

                            <button type="button" onClick={handleGoogle} className="login-google-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Acceder con Google
                            </button>
                        </form>

                        <div className="login-footer">
                            ¿Aún no tienes cuenta? <Link to="/register" className="login-register-link">Regístrate gratis</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgot && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }} onClick={() => setShowForgot(false)}>
                    <div style={{
                        background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 400, width: '90%',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>Restablecer contraseña</h3>
                        <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                        <form onSubmit={handleForgotPassword}>
                            <input
                                type="email"
                                value={forgotEmail}
                                onChange={e => setForgotEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                autoFocus
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
                                    border: '1px solid #e2e8f0', fontSize: '0.9375rem',
                                    marginBottom: '1rem', boxSizing: 'border-box'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowForgot(false)}
                                    style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" disabled={forgotLoading}
                                    style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: 'none', background: '#0d9488', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    {forgotLoading ? '...' : 'Enviar enlace'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
