/**
 * Utilidades para validación de datos en el frontend
 */
export const validationUtils = {
    /**
     * Valida formato de email estándar
     */
    isValidEmail: (email) => {
        if (!email) return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    /**
     * Valida que un número sea mayor a cero
     */
    isPositiveNumber: (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    },

    /**
     * Valida que un número sea mayor o igual a cero
     */
    isNonNegativeNumber: (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
    },

    /**
     * Valida formato de NIT (Colombia) simple o genérico
     */
    isValidTaxId: (id) => {
        if (!id) return false;
        return id.trim().length >= 5;
    },

    /**
     * Valida longitud de teléfono (mínimo 7 caracteres)
     */
    isValidPhone: (phone) => {
        if (!phone) return false;
        const cleaned = phone.replace(/[^0-9]/g, '');
        return cleaned.length >= 7;
    }
};
