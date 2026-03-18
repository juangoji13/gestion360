import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'

const OFFLINE_QUEUE_KEY = '@facturacion_offline_queue'

export const OfflineManager = {
    async checkIsOffline() {
        const state = await NetInfo.fetch()
        return !state.isConnected || !state.isInternetReachable
    },

    async saveToQueue(invoiceData, invoiceItems) {
        try {
            const currentQueueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
            const currentQueue = currentQueueStr ? JSON.parse(currentQueueStr) : []
            
            const pendingInvoice = {
                id: `local_${Date.now()}`,
                invoiceData,
                invoiceItems,
                savedAt: new Date().toISOString()
            }
            
            currentQueue.push(pendingInvoice)
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue))
            return pendingInvoice.id
        } catch (error) {
            console.error('Error guardando factura offline:', error)
            throw new Error('No se pudo guardar la factura localmente')
        }
    },

    async getQueue() {
        try {
            const queueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
            return queueStr ? JSON.parse(queueStr) : []
        } catch (error) {
            console.error('Error leyendo la cola offline:', error)
            return []
        }
    },

    async clearQueueItem(localId) {
        try {
            const currentQueueStr = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
            if (!currentQueueStr) return
            
            let currentQueue = JSON.parse(currentQueueStr)
            currentQueue = currentQueue.filter(item => item.id !== localId)
            
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue))
        } catch (error) {
            console.error('Error limpiando factura de la cola:', error)
        }
    }
}
