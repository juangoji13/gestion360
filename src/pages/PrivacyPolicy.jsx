import './Auth.css'

export default function PrivacyPolicy() {
    return (
        <div style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem', lineHeight: 1.7, color: '#374151' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                Política de Privacidad y Tratamiento de Datos Personales
            </h1>
            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.875rem' }}>
                Vigente desde: 10 de marzo de 2026 · Ley 1581 de 2012 (Colombia) y Decreto 1377 de 2013
            </p>

            <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    1. Responsable del Tratamiento
                </h2>
                <p>
                    <strong>Gestión 360</strong> actúa como responsable del tratamiento de los datos personales
                    recopilados a través de esta plataforma. Para consultas relacionadas con sus datos, puede
                    contactarnos a través del correo registrado en su cuenta.
                </p>
            </section>

            <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    2. Datos que Recopilamos
                </h2>
                <ul style={{ paddingLeft: '1.5rem' }}>
                    <li>Datos de identificación: nombre, correo electrónico, NIT/CC</li>
                    <li>Datos de contacto: teléfono, dirección</li>
                    <li>Datos comerciales: facturas, productos, clientes de su negocio</li>
                    <li>Datos técnicos: logs de acceso, dirección IP (gestionados por Supabase/Vercel)</li>
                </ul>
            </section>

            <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    3. Finalidad del Tratamiento
                </h2>
                <ul style={{ paddingLeft: '1.5rem' }}>
                    <li>Gestión de la plataforma de facturación y ERP</li>
                    <li>Generación de facturas, reportes y estadísticas de su negocio</li>
                    <li>Comunicaciones relacionadas con su cuenta (confirmación, recuperación de contraseña)</li>
                    <li>Cumplimiento de obligaciones legales y fiscales</li>
                </ul>
            </section>

            <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    4. Sus Derechos (Ley 1581/2012)
                </h2>
                <p>Como titular de sus datos personales, usted tiene derecho a:</p>
                <ul style={{ paddingLeft: '1.5rem' }}>
                    <li><strong>Conocer</strong> qué datos tenemos sobre usted</li>
                    <li><strong>Actualizar y rectificar</strong> sus datos desde su perfil</li>
                    <li><strong>Suprimir</strong> sus datos personales (contacte al administrador)</li>
                    <li><strong>Revocar</strong> la autorización del tratamiento en cualquier momento</li>
                    <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC)</li>
                </ul>
            </section>

            <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    5. Seguridad de los Datos
                </h2>
                <p>
                    Sus datos son almacenados en <strong>Supabase</strong> con cifrado en tránsito (TLS 1.3) y en
                    reposo (AES-256). Implementamos Row Level Security (RLS) para garantizar que cada usuario solo
                    acceda a sus propios datos. Las contraseñas nunca se almacenan en texto plano.
                </p>
            </section>

            <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    6. Transferencia de Datos
                </h2>
                <p>
                    Sus datos pueden ser procesados por terceros de confianza: <strong>Supabase Inc.</strong>
                    (infraestructura de base de datos, con servidores en EE. UU.) y <strong>Vercel Inc.</strong>
                    (alojamiento de la aplicación). Ambos proveedores cumplen con estándares internacionales de
                    seguridad (SOC 2, ISO 27001).
                </p>
            </section>

            <section style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    7. Retención de Datos
                </h2>
                <p>
                    Sus datos se conservan mientras mantenga una cuenta activa. Si solicita la eliminación de su
                    cuenta, sus datos serán eliminados en un plazo máximo de 30 días hábiles, salvo obligaciones
                    legales que exijan su conservación.
                </p>
            </section>

            <section>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                    8. Cambios a esta Política
                </h2>
                <p>
                    Cualquier modificación a esta política será notificada mediante la plataforma. El uso continuado
                    de la aplicación después de la notificación implica aceptación de los cambios.
                </p>
            </section>
        </div>
    )
}
