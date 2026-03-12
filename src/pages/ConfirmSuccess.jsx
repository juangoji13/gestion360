import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Smartphone, Globe } from 'lucide-react';
import './Auth.css';

export default function ConfirmSuccess() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card glass-effect animate-in">
        <div className="auth-header">
          <div className="success-icon-container">
            <CheckCircle size={64} color="var(--primary)" />
          </div>
          <h1 className="auth-title">¡Registro Confirmado!</h1>
          <p className="auth-subtitle">Tu cuenta y empresa han sido activadas con éxito.</p>
        </div>

        <div className="auth-body" style={{ textAlign: 'center', gap: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div className="confirmation-steps">
            <div className="step-item">
              <div className="step-number">1</div>
              <p>Tu cuenta de usuario está lista.</p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <p>Tu empresa ha sido creada automáticamente.</p>
            </div>
          </div>

          <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/login')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Globe size={18} />
              Entrar Web
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => window.location.href = 'gestion360://login'}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Smartphone size={18} />
              Volver a la App
            </button>
          </div>
        </div>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ya puedes cerrar esta ventana y empezar a facturar.
          </p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .success-icon-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          background: rgba(255,255,255,0.05);
          padding: 10px 15px;
          border-radius: 12px;
          text-align: left;
        }
        .step-number {
          background: var(--primary);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
          flex-shrink: 0;
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-in {
          animation: slideUp 0.6s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
