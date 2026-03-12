import { supabase } from '../lib/supabase'
import { sanitizeSearch } from '../utils/security'

export const invoiceService = {
    async getAll(businessId, { page = 1, pageSize = 10, status = 'all', search = '' } = {}) {
        let query = supabase
            .from('invoices')
            .select(`
                *,
                client:clients(name, email),
                invoice_items(*)
            `, { count: 'exact' })
            .eq('business_id', businessId)

        if (status !== 'all') {
            query = query.eq('status', status)
        }

        if (search) {
            const safe = sanitizeSearch(search)
            if (safe) query = query.ilike('invoice_number', `%${safe}%`)
        }

        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to)

        if (error) throw error
        return { data, count }
    },

    async getById(id) {
        const { data, error } = await supabase
            .from('invoices')
            .select(`
        *,
        client:clients(*),
        invoice_items(
          *,
          product:products(name, sku)
        )
      `)
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    async create(invoice, items) {
        // Usamos la nueva función atómica (RPC) que maneja stock y numeración
        const { data, error } = await supabase.rpc('create_invoice_final', {
            p_invoice: invoice,
            p_items: items
        })
        if (error) throw error
        return data
    },

    async updateStatus(id, status) {
        const { data, error } = await supabase
            .from('invoices')
            .update({ status })
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data
    },

    async addPayment(id, currentAmountPaid, newPaymentAmount, totalInvoiceAmount) {
        const newTotalPaid = (parseFloat(currentAmountPaid) || 0) + parseFloat(newPaymentAmount)
        const newStatus = newTotalPaid >= parseFloat(totalInvoiceAmount) ? 'paid' : 'pending' // Asumimos pending o partial. La DB solo tiene pending/paid/overdue por ahora.

        const { data, error } = await supabase
            .from('invoices')
            .update({
                amount_paid: newTotalPaid,
                status: newStatus
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async delete(id) {
        // First retrieve all items from this invoice to deduct stock
        const { data: items, error: fetchError } = await supabase
            .from('invoice_items')
            .select('product_id, quantity')
            .eq('invoice_id', id)
        if (fetchError) throw fetchError

        // Process stock returns
        if (items && items.length > 0) {
            for (const item of items) {
                if (!item.product_id) continue
                // Get current stock
                const { data: pData } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.product_id)
                    .single()

                if (pData) {
                    const returnStock = (pData.stock || 0) + (parseFloat(item.quantity) || 0)
                    await supabase
                        .from('products')
                        .update({ stock: returnStock })
                        .eq('id', item.product_id)
                }
            }
        }

        // Now actually delete items and invoice
        await supabase.from('invoice_items').delete().eq('invoice_id', id)
        const { error } = await supabase.from('invoices').delete().eq('id', id)
        if (error) throw error
    },

    async getNextNumber(businessId) {
        const { data, error } = await supabase
            .from('invoices')
            .select('invoice_number')
            .eq('business_id', businessId)
            .order('created_at', { ascending: false })
            .limit(1)
        if (error) throw error
        if (!data || data.length === 0) return 'FAC-0001'
        const lastNum = parseInt((data[0].invoice_number.match(/(\d+)(?!.*\d)/) || ['', '0'])[0]) || 0
        return `FAC-${String(lastNum + 1).padStart(4, '0')}`
    },

    async getStatsV2(businessId, startDate, endDate) {
        const { data, error } = await supabase.rpc('get_dashboard_stats_v2', {
            p_business_id: businessId,
            p_start_date: startDate,
            p_end_date: endDate
        })
        if (error) throw error
        return data
    }
}
