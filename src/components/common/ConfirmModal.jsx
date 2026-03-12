import { AlertTriangle, X } from 'lucide-react'
import './ConfirmModal.css'

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    isDanger = true
}) {
    if (!isOpen) return null

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content">
                <button className="confirm-modal-close" onClick={onClose} aria-label="Cerrar modal">
                    <X size={20} />
                </button>

                <div className="confirm-modal-header">
                    <div className={`confirm-icon-wrapper ${isDanger ? 'danger' : 'warning'}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="confirm-modal-title">{title}</h3>
                </div>

                <div className="confirm-modal-body">
                    <p>{message}</p>
                </div>

                <div className="confirm-modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
