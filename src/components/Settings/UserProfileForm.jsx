import React from 'react'

export default function UserProfileForm({ 
    userForm, 
    setUserForm, 
    isUserEditing, 
    savingUser 
}) {
    const handleChange = (e) => {
        const { name, value } = e.target
        setUserForm(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="profile-form-container">
            <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                marginBottom: '1.5rem', 
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                👤 Información Personal
            </h3>

            <div className="form-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '1.5rem' 
            }}>
                <div className="form-group">
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: 'var(--text-muted)' 
                    }}>
                        Nombre Completo
                    </label>
                    <input
                        type="text"
                        name="full_name"
                        value={userForm.full_name}
                        onChange={handleChange}
                        disabled={!isUserEditing || savingUser}
                        placeholder="Tu nombre completo"
                        className="form-input"
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '1.5px solid var(--border-color)',
                            backgroundColor: isUserEditing ? 'var(--bg-input)' : 'var(--bg-disabled)',
                            color: 'var(--text-main)',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        }}
                    />
                </div>

                <div className="form-group">
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '0.5rem', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: 'var(--text-muted)' 
                    }}>
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={userForm.email}
                        onChange={handleChange}
                        disabled={!isUserEditing || savingUser}
                        placeholder="correo@ejemplo.com"
                        className="form-input"
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            border: '1.5px solid var(--border-color)',
                            backgroundColor: isUserEditing ? 'var(--bg-input)' : 'var(--bg-disabled)',
                            color: 'var(--text-main)',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                        }}
                    />
                    {isUserEditing && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.5rem', fontWeight: 500 }}>
                            ⚠️ Si cambias el correo, deberás confirmarlo en la nueva dirección.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
