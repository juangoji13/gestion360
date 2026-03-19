import { useAuth } from '../context/AuthContext'
import { useSettings } from '../hooks/useSettings'
import BusinessProfileForm from '../components/Settings/BusinessProfileForm'
import UserProfileForm from '../components/Settings/UserProfileForm'

export default function Settings() {
    const { user, business, updateBusiness, updateUser } = useAuth()

    const {
        form,
        setForm,
        isEditing,
        setIsEditing,
        saving,
        uploadingLogo,
        hasChanges,
        handleSubmit,
        handleLogoUpload,
        cancelEditing,
        fileInputRef,
        // User Profile
        userForm,
        setUserForm,
        isUserEditing,
        setIsUserEditing,
        savingUser,
        hasUserChanges,
        handleUserSubmit,
        cancelUserEditing,
    } = useSettings(user, business, updateUser, updateBusiness)

    return (
        <div className="page" style={{ padding: '2rem' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>Configuración</h1>
                <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>Personaliza tu perfil y los datos de tu negocio</p>
            </div>

            <div style={{ display: 'grid', gap: '2rem', maxWidth: 900 }}>
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="card" style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: '100%' }}>
                            <UserProfileForm
                                userForm={userForm}
                                setUserForm={setUserForm}
                                isUserEditing={isUserEditing}
                                savingUser={savingUser}
                            />
                        </div>
                    </div>
                    
                    {!isUserEditing ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setIsUserEditing(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px' }}
                            >
                                ✏️ Editar Perfil
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={cancelUserEditing}
                                style={{ padding: '0.6rem 1.2rem', borderRadius: '10px' }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleUserSubmit}
                                disabled={savingUser || !hasUserChanges}
                                style={{
                                    padding: '0.6rem 1.5rem',
                                    borderRadius: '10px',
                                    opacity: (!hasUserChanges || savingUser) ? 0.6 : 1,
                                    cursor: (!hasUserChanges || savingUser) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {savingUser ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : '✅ Guardar Perfil'}
                            </button>
                        </div>
                    )}
                </div>

                {/* SECCIÓN 2: DATOS DEL NEGOCIO */}
                <div className="card" style={{ padding: '2.5rem', borderRadius: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        🏢 Datos del Negocio
                    </h3>
                    
                    <form onSubmit={handleSubmit}>
                        <BusinessProfileForm
                            form={form}
                            setForm={setForm}
                            isEditing={isEditing}
                            uploadingLogo={uploadingLogo}
                            handleLogoUpload={handleLogoUpload}
                            fileInputRef={fileInputRef}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                            {!isEditing ? (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsEditing(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px' }}
                                >
                                    ✏️ Editar Negocio
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={cancelEditing}
                                        style={{ padding: '0.6rem 1.2rem', borderRadius: '10px' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving || !hasChanges}
                                        style={{
                                            padding: '0.6rem 1.5rem',
                                            borderRadius: '10px',
                                            opacity: (!hasChanges || saving) ? 0.6 : 1,
                                            cursor: (!hasChanges || saving) ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {saving ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : '✅ Guardar Negocio'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
