import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Smartphone, Globe, Rocket, ShieldCheck } from 'lucide-react';
import './Auth.css';

export default function ConfirmSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "¡Cuenta Activada! | Gestión360 🚀";
    
    // Inyectar meta tags para que la previsualización sea hermosa
    const metaTags = [
      { property: 'og:title', content: '✓ Cuenta Activada con Éxito' },
      { property: 'og:description', content: 'Bienvenido a Gestión360. Tu espacio de trabajo profesional está listo para facturar.' },
      { property: 'og:image', content: 'https://sistemadefacturacion-silk.vercel.app/logo.png' },
      { name: 'description', content: 'Confirmación de cuenta exitosa en Gestión360.' }
    ];

    metaTags.forEach(tag => {
      let element = document.querySelector(`meta[${tag.property ? 'property="' + tag.property + '"' : 'name="' + tag.name + '"'}]`);
      if (!element) {
        element = document.createElement('meta');
        if (tag.property) element.setAttribute('property', tag.property);
        if (tag.name) element.setAttribute('name', tag.name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-bg-effects">
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
        <div className="auth-bg-orb auth-bg-orb-3"></div>
      </div>

      <div className="auth-card glass-effect animate-in" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <div className="auth-header">
          <div className="premium-icon-badge">
            <div className="icon-pulse-effect"></div>
            <ShieldCheck size={48} className="rocket-icon" style={{ color: 'white' }} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '2.2rem', marginTop: '1.5rem' }}>¡Cuenta Activada!</h1>
          <p className="auth-subtitle">Tu dirección de correo ha sido confirmada con éxito.</p>
        </div>

        <div className="auth-body" style={{ marginTop: '2rem' }}>
          <div className="success-message-container" style={{ 
            background: 'rgba(16, 185, 129, 0.05)', 
            padding: '25px', 
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            marginBottom: '2rem'
          }}>
            <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '500', lineHeight: '1.6', margin: 0 }}>
              ¡Excelente! Tu cuenta profesional ya está lista.
            </p>
            <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: '1rem' }}>
              Ya puedes cerrar esta ventana y regresar a la aplicación de <strong>Gestión360</strong> en tu dispositivo para comenzar a configurar tu empresa.
            </p>
          </div>

          <div style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p>Si estás en una computadora, también puedes ingresar directamente desde el sitio web principal.</p>
          </div>
        </div>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          <div className="premium-tag">
            <CheckCircle size={14} />
            <span>Verificación Oficial Gestión360</span>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-icon-badge {
          position: relative;
          width: 90px;
          height: 90px;
          margin: 0 auto;
          background: linear-gradient(135deg, var(--primary) 0%, #15A362 100%);
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.3);
        }
        .rocket-icon {
          animation: float 3s ease-in-out infinite;
        }
        .icon-pulse-effect {
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--primary);
          border-radius: 25px;
          opacity: 0.3;
          animation: pulse-ring 2s infinite;
        }
        .premium-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--primary);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.1; }
          100% { transform: scale(0.95); opacity: 0.3; }
        }
        .animate-in {
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUpFade {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
