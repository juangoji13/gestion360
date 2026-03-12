import { supabase } from '../lib/supabase'
import { sanitizeSearch } from '../utils/security'

export const clientService = {
    async getAll(businessId, { page = 1, pageSize = 10, search = '' } = {}) {
        let query = supabase
            .from('clients')
            .select('*', { count: 'exact' })
            .eq('business_id', businessId)

        if (search) {
            const safe = sanitizeSearch(search)
            if (safe) query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,tax_id.ilike.%${safe}%`)
        }

        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query
            .order('name')
            .range(from, to)

        if (error) throw error
        return { data, count }
    },

    async create(client) {
        const sanitized = Object.fromEntries(
            Object.entries(client).map(([key, value]) => [
                key,
                typeof value === 'string' && value.trim() === '' ? null : value
            ])
        )

        const { data, error } = await supabase
            .from('clients')
            .insert([sanitized])
            .select()
            .single()
        if (error) throw error
        return data
    },

    async update(id, updates) {
        const sanitized = Object.fromEntries(
            Object.entries(updates).map(([key, value]) => [
                key,
                typeof value === 'string' && value.trim() === '' ? null : value
            ])
        )

        const { data, error } = await supabase
            .from('clients')
            .update(sanitized)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data
    },

    async delete(id) {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)
        if (error) throw error
    },

    async count(businessId) {
        const { count, error } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
        if (error) throw error
        return count
    }
}
