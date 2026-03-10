import { useAuth } from '../context/AuthContext'
import { useSettings } from '../hooks/useSettings'
import BusinessProfileForm from '../components/Settings/BusinessProfileForm'

export default function Settings() {
    const { business, updateBusiness } = useAuth()

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
        fileInputRef
    } = useSettings(business, updateBusiness)

    return (
        <div className="page" style={{ padding: '2rem' }}>
            <div className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>Configuración</h1>
                    <p className="page-subtitle" style={{ color: 'var(--text-muted)' }}>Personaliza los datos de tu negocio</p>
                </div>
                {!isEditing && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsEditing(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px' }}
                    >
                        <span>✏️</span> Editar información
                    </button>
                )}
            </div>

            <div className="card" style={{ maxWidth: 800, padding: '2.5rem', borderRadius: '24px', position: 'relative' }}>
                <form onSubmit={handleSubmit}>
                    <BusinessProfileForm
                        form={form}
                        setForm={setForm}
                        isEditing={isEditing}
                        uploadingLogo={uploadingLogo}
                        handleLogoUpload={handleLogoUpload}
                        fileInputRef={fileInputRef}
                    />

                    {isEditing && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={cancelEditing}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving || !hasChanges}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '12px',
                                    opacity: (!hasChanges || saving) ? 0.6 : 1,
                                    cursor: (!hasChanges || saving) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {saving ? <div className="spinner" style={{ width: 18, height: 18 }}></div> : '✅ Guardar cambios'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
