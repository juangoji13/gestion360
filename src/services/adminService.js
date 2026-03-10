import { supabase } from '../lib/supabase'

export const adminService = {
    async isAdmin() {
        const { data, error } = await supabase
            .from('admins')
            .select('id, role')
            .maybeSingle()
        if (error) return false
        return !!data
    },

    async getStats() {
        const { data, error } = await supabase.rpc('get_admin_stats')
        if (error) throw error
        return data
    },
}
