import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

console.log('🛡️  Validando entorno de construcción...');

// Cargar .env manualmente para validación pre-build
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
];

const missing = required.filter(key => {
    const regex = new RegExp(`^${key}=(.+)`, 'm');
    return !regex.test(envContent) && !process.env[key];
});

if (missing.length > 0) {
    console.error('\n❌ ERROR: Faltan variables de entorno críticas en .env:');
    missing.forEach(m => console.error(`   - ${m}`));
    console.error('\nEl build se ha detenido para evitar un despliegue fallido.\n');
    process.exit(1);
}

console.log('✅ Entorno validado correctamente.\n');
