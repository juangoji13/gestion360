import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Configuración de Supabase incompleta. ' +
    'Por favor, verifica que VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén definidos en tu archivo .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
