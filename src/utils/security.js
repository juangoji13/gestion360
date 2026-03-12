/**
 * Utilidades de seguridad centralizadas
 * Gestión 360 - Módulo de Seguridad
 */

// ─── SANITIZACIÓN ────────────────────────────────────────────────────────────

/**
 * Elimina caracteres peligrosos de un string de búsqueda.
 * Previene patrones de inyección en queries ilike de Supabase.
 */
export function sanitizeSearch(input, maxLength = 100) {
    if (!input || typeof input !== 'string') return ''
    return input
        .trim()
        .slice(0, maxLength)
        // Elimina caracteres especiales de SQL / regex excepto los usuales
        .replace(/[;'"\\<>{}[\]|`^]/g, '')
}

/**
 * Sanitiza texto libre para campos generales (nombre, descripción, notas).
 */
export function sanitizeText(input, maxLength = 500) {
    if (!input || typeof input !== 'string') return ''
    return input.trim().slice(0, maxLength)
}

/**
 * Sanitiza cantidades numéricas. Retorna 0 si el valor no es válido.
 */
export function sanitizeNumber(value, { min = 0, max = 999999999 } = {}) {
    const num = parseFloat(value)
    if (isNaN(num) || !isFinite(num)) return 0
    return Math.min(Math.max(num, min), max)
}

// ─── VALIDACIÓN ──────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NIT_REGEX = /^[0-9\-]{5,20}$/
const PHONE_REGEX = /^[\d\s\+\-\(\)]{7,20}$/

/**
 * Valida formato de email.
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false
    return EMAIL_REGEX.test(email.trim()) && email.length <= 254
}

/**
 * Valida contraseña con política de seguridad reforzada.
 * Mínimo 8 chars, al menos 1 mayúscula, 1 número, 1 carácter especial.
 */
export function validatePassword(password) {
    const errors = []
    if (!password) {
        return { valid: false, errors: ['La contraseña es requerida'] }
    }
    if (password.length < 8) {
        errors.push('Mínimo 8 caracteres')
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Al menos una letra mayúscula')
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Al menos un número')
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        errors.push('Al menos un carácter especial (!@#$%...)')
    }
    if (password.length > 128) {
        errors.push('Máximo 128 caracteres')
    }
    return { valid: errors.length === 0, errors }
}

/**
 * Valida NIT/CC colombiano.
 */
export function isValidTaxId(taxId) {
    if (!taxId) return true // Campo opcional
    return NIT_REGEX.test(taxId.trim())
}

/**
 * Valida teléfono.
 */
export function isValidPhone(phone) {
    if (!phone) return true // Campo opcional
    return PHONE_REGEX.test(phone.trim())
}

// ─── RATE LIMITING (cliente) ──────────────────────────────────────────────────

const rateLimitStore = new Map()

/**
 * Rate limiter en cliente para prevenir abuso de formularios.
 * @param {string} key - Identificador único de la acción (ej: 'login', 'forgot-password')
 * @param {number} maxAttempts - Intentos máximos en la ventana de tiempo
 * @param {number} windowMs - Ventana de tiempo en milisegundos
 * @returns {{ allowed: boolean, remainingMs: number, attemptsLeft: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now()
    const entry = rateLimitStore.get(key) || { attempts: [], blockedUntil: 0 }

    // Si está bloqueado, retornar
    if (entry.blockedUntil > now) {
        return {
            allowed: false,
            remainingMs: entry.blockedUntil - now,
            attemptsLeft: 0
        }
    }

    // Limpiar intentos fuera de la ventana
    entry.attempts = entry.attempts.filter(t => t > now - windowMs)
    entry.attempts.push(now)

    if (entry.attempts.length > maxAttempts) {
        // Bloquear por el doble de la ventana de tiempo
        entry.blockedUntil = now + windowMs * 2
        entry.attempts = []
        rateLimitStore.set(key, entry)
        return {
            allowed: false,
            remainingMs: windowMs * 2,
            attemptsLeft: 0
        }
    }

    rateLimitStore.set(key, entry)
    return {
        allowed: true,
        remainingMs: 0,
        attemptsLeft: maxAttempts - entry.attempts.length
    }
}

/**
 * Resetea el contador de rate limit para una clave (ej: después de login exitoso).
 */
export function resetRateLimit(key) {
    rateLimitStore.delete(key)
}

// ─── PROTECCIÓN DE DATOS (Ley 1581/2012) ─────────────────────────────────────

/**
 * Enmascara datos personales sensibles para logs.
 * Ejemplo: "juan@gmail.com" → "j***@gmail.com"
 */
export function maskEmail(email) {
    if (!email || !email.includes('@')) return '***'
    const [local, domain] = email.split('@')
    return `${local[0]}${'*'.repeat(Math.min(local.length - 1, 4))}@${domain}`
}

/**
 * Enmascara número de teléfono.
 * Ejemplo: "3001234567" → "300****567"
 */
export function maskPhone(phone) {
    if (!phone) return '***'
    const clean = phone.replace(/\D/g, '')
    if (clean.length < 7) return '***'
    return `${clean.slice(0, 3)}${'*'.repeat(clean.length - 6)}${clean.slice(-3)}`
}
