import { supabase } from '../lib/supabase'
import { sanitizeSearch } from '../utils/security'

export const productService = {
    async getAll(businessId, { page = 1, pageSize = 10, search = '' } = {}) {
        let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('business_id', businessId)

        if (search) {
            const safe = sanitizeSearch(search)
            if (safe) query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%`)
        }

        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query
            .order('name')
            .range(from, to)

        if (error) throw error
        return { data, count }
    },

    async create(product) {
        const sanitized = Object.fromEntries(
            Object.entries(product).map(([key, value]) => [
                key,
                typeof value === 'string' && value.trim() === '' ? null : value
            ])
        )

        const { data, error } = await supabase
            .from('products')
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
            .from('products')
            .update(sanitized)
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data
    },

    async delete(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
        if (error) throw error
    },

    async count(businessId) {
        const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
        if (error) throw error
        return count
    }
}
