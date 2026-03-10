import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext({})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast])
    const error = useCallback((msg) => addToast(msg, 'error'), [addToast])

    return (
        <ToastContext.Provider value={{ success, error }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        {toast.type === 'success' ? '✓' : '✕'} {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
