import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'
import './Login.css'

export default function ResetPassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const toast = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            toast.success('¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.')
            navigate('/login')
        } catch (err) {
            toast.error(err.message || 'Error al actualizar la contraseña')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className="login-right-side" style={{ width: '100%', maxWidth: 450, flex: 'none' }}>
                <div className="login-form-wrapper">
                    <div className="login-brand-protagonist-right">
                        <img src="/logo.png" alt="Gestión360 Logo" />
                    </div>

                    <div className="login-form-header">
                        <h2>Nueva Contraseña</h2>
                        <p>Ingresa tu nueva clave de acceso.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-input-group">
                            <label className="login-label" htmlFor="password">Nueva Contraseña</label>
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
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="login-input-group">
                            <label className="login-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <div className="login-input-wrapper">
                                <span className="login-input-icon">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <input
                                    className="login-input"
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button className="login-submit-btn" type="submit" disabled={loading}>
                            {loading ? <div className="login-spinner" /> : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
