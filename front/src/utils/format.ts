export const formatearMoneda = (numero: number, digitos = 2, locale = 'es-ES') => {
    return numero.toLocaleString(locale, {
        minimumFractionDigits: digitos,
        maximumFractionDigits: digitos
    });
}