export const formatearMoneda = (numero: number, digitos = 2, locale = 'es-AR') => {
    return numero.toLocaleString(locale, {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: digitos,
        maximumFractionDigits: digitos
    });
}

export const formatearFecha = (fecha: Date | string, locale = 'es-AR') => {
    const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

export const formatearPorcentaje = (rate: number, locale = 'es-AR') => {
    return (rate * 100).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '%';
}

// English aliases for consistency with existing code
export const formatCurrency = formatearMoneda;
export const formatDate = formatearFecha;
export const formatPercentage = formatearPorcentaje;