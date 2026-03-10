require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkSchema() {
    console.log('Fetching one invoice...');
    const { data, error } = await supabase.from('invoices').select('*').limit(1).single();
    if (error) {
        if (error.code === 'PGRST116') {
            console.log('No invoices found, but query succeeded for columns.');
            const { data: cols } = await supabase.from('invoices').select('*').limit(0);
            console.log(cols);
        } else {
            console.error('Error:', error);
        }
    } else {
        console.log('Invoice columns:', Object.keys(data));
    }
}
checkSchema();
