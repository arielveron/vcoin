/**
 * Percentage formatting utilities
 * Centralized percentage formatting to ensure consistency across the application
 */

export const formatPercentage = (
  rate: number,
  options: {
    decimals?: number;
    locale?: string;
    showSign?: boolean;
  } = {}
): string => {
  const { decimals = 2, locale = 'es-AR', showSign = false } = options;
  
  const percentage = (rate * 100).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  const sign = showSign && rate > 0 ? '+' : '';
  return `${sign}${percentage}%`;
};

export const formatPercentageFromDecimal = (
  decimal: number,
  options: {
    decimals?: number;
    locale?: string;
    showSign?: boolean;
  } = {}
): string => {
  return formatPercentage(decimal, options);
};

export const formatPercentageFromWhole = (
  wholeNumber: number,
  options: {
    decimals?: number;
    locale?: string;
    showSign?: boolean;
  } = {}
): string => {
  return formatPercentage(wholeNumber / 100, options);
};
