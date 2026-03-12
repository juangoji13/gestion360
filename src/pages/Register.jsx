import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { validatePassword, checkRateLimit } from '../utils/security'
import './Auth.css'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const { signUp, signInWithGoogle } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Prevents double submission when already loading
        if (loading) return

        setError('')

        // Rate limiting: max 3 registros por 10 minutos
        const rl = checkRateLimit('register', 3, 600000)
        if (!rl.allowed) {
            setError('Demasiados intentos. Espera unos minutos.')
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        // Validación de contraseña fuerte
        const pwValidation = validatePassword(password)
        if (!pwValidation.valid) {
            setError(pwValidation.errors.join('. '))
            return
        }

        setLoading(true)
        try {
            await signUp(email, password, businessName)
            setSuccess(true)
            // No automated navigation, let the user read the email confirmation instructions
        } catch (err) {
            setError(err.message || 'Error al registrarte')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setError('')
        try {
            await signInWithGoogle()
        } catch (err) {
            setError(err.message || 'Error con Google')
        }
    }

    if (success) {
        return (
            <div className="auth-page">
                <div className="auth-bg-effects">
                    <div className="auth-bg-orb auth-bg-orb-1"></div>
                    <div className="auth-bg-orb auth-bg-orb-2"></div>
                </div>
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="auth-logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                    <h2 className="auth-title">¡Verifica tu correo!</h2>
                    <p className="auth-subtitle">
                        Te hemos enviado un enlace de confirmación a <strong>{email}</strong>.
                        Por favor, confirma tu cuenta para poder iniciar sesión.
                    </p>
                    <div style={{ marginTop: '2rem' }}>
                        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Ir al Inicio de Sesión
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <div className="auth-bg-effects">
                <div className="auth-bg-orb auth-bg-orb-1"></div>
                <div className="auth-bg-orb auth-bg-orb-2"></div>
                <div className="auth-bg-orb auth-bg-orb-3"></div>
            </div>
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🚀</div>
                    <h1 className="auth-title">Crear Cuenta</h1>
                    <p className="auth-subtitle">Registra tu negocio para empezar</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                {/* Google button */}
                <button
                    type="button"
                    className="auth-google-btn"
                    onClick={handleGoogle}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Registrarse con Google
                </button>

                <div className="auth-divider">
                    <span>o regístrate con email</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Nombre del Negocio</label>
                        <input
                            id="register-business"
                            type="text"
                            className="form-input"
                            placeholder="Mi Empresa S.A.S"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Correo electrónico</label>
                        <input
                            id="register-email"
                            type="email"
                            className="form-input"
                            placeholder="tu@correo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            id="register-password"
                            type="password"
                            className="form-input"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirmar Contraseña</label>
                        <input
                            id="register-confirm"
                            type="password"
                            className="form-input"
                            placeholder="Repite tu contraseña"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        id="register-submit"
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? <div className="spinner"></div> : 'Crear Cuenta'}
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </div>
    )
}
