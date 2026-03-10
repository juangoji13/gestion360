const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
s.from('invoice_items').select('*').limit(1).then(r => console.log(r)).catch(console.error)
