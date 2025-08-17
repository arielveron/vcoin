/**
 * Currency formatting utilities
 * Centralized currency formatting to ensure consistency across the application
 */

export const formatCurrency = (
  amount: number, 
  options: {
    decimals?: number;
    locale?: string;
    currency?: string;
  } = {}
): string => {
  const { decimals = 2, locale = 'es-AR', currency = 'ARS' } = options;
  
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatNumber = (
  number: number,
  options: {
    decimals?: number;
    locale?: string;
  } = {}
): string => {
  const { decimals = 2, locale = 'es-AR' } = options;
  
  return number.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatCompactCurrency = (amount: number, locale = 'es-AR'): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount, { locale });
};
