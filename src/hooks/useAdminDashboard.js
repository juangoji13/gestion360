import { useState, useEffect, useCallback } from 'react'
import { adminService } from '../services/adminService'

export function useAdminDashboard(isAdmin) {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeView, setActiveView] = useState('overview')

    const loadStats = useCallback(async () => {
        if (!isAdmin) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const data = await adminService.getStats()
            setStats(data)
        } catch (err) {
            setError(err.message || 'Error al cargar estadísticas de administración')
        } finally {
            setLoading(false)
        }
    }, [isAdmin])

    useEffect(() => {
        loadStats()
    }, [loadStats])

    return {
        stats,
        loading,
        error,
        activeView,
        setActiveView,
        refresh: loadStats
    }
}
