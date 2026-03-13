import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Smartphone, Globe, Rocket, ShieldCheck } from 'lucide-react';
import './Auth.css';

export default function ConfirmSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "¡Cuenta Activada! | Gestión360 🚀";
  }, []);

  return (
    <div className="auth-page">
      {/* Background effects consistent with registration */}
      <div className="auth-bg-effects">
        <div className="auth-bg-orb auth-bg-orb-1"></div>
        <div className="auth-bg-orb auth-bg-orb-2"></div>
        <div className="auth-bg-orb auth-bg-orb-3"></div>
      </div>

      <div className="auth-card glass-effect animate-in" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="premium-icon-badge">
            <div className="icon-pulse-effect"></div>
            <Rocket size={48} className="rocket-icon" />
          </div>
          <h1 className="auth-title" style={{ fontSize: '2.5rem', marginTop: '1.5rem' }}>¡Cuenta Activada!</h1>
          <p className="auth-subtitle">Bienvenido a la comunidad de Gestión360. Tu espacio de trabajo está listo.</p>
        </div>

        <div className="auth-body" style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div className="success-features">
            <div className="feature-item">
              <ShieldCheck size={20} className="feature-icon" />
              <span>Acceso seguro habilitado</span>
            </div>
            <div className="feature-item">
              <ShieldCheck size={20} className="feature-icon" />
              <span>Empresa configurada automáticamente</span>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', margin: '1.5rem 0', lineHeight: '1.6' }}>
            Tu cuenta ha sido verificada exitosamente. Ahora puedes comenzar a gestionar tus facturas, inventario y clientes desde cualquier dispositivo.
          </p>

          <div className="action-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button 
              className="btn btn-primary btn-lg" 
              onClick={() => navigate('/login')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
            >
              <Globe size={20} />
              Iniciar Sesión en Web
            </button>
            <button 
              className="btn btn-secondary btn-lg" 
              onClick={() => window.location.href = 'gestion360://login'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
            >
              <Smartphone size={20} />
              Abrir en la Aplicación
            </button>
          </div>
        </div>

        <div className="auth-footer" style={{ marginTop: '2.5rem' }}>
          <div className="premium-tag">
            <CheckCircle size={14} />
            <span>Verificación Oficial Gestión360</span>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .premium-icon-badge {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto;
          background: linear-gradient(135deg, var(--primary) 0%, #15A362 100%);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 15px 35px rgba(16, 185, 129, 0.3);
          transform: rotate(-5deg);
        }
        .rocket-icon {
          color: white;
          animation: float 3s ease-in-out infinite;
        }
        .icon-pulse-effect {
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--primary);
          border-radius: 30px;
          opacity: 0.3;
          animation: pulse-ring 2s infinite;
        }
        .success-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-main);
          font-weight: 500;
          font-size: 0.95rem;
        }
        .feature-icon {
          color: var(--primary);
        }
        .action-stack .btn {
          width: 100%;
          height: 56px;
          font-weight: bold;
          font-size: 1.1rem;
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
          letter-spacing: 0.5px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(5deg); }
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
