/**
 * Centralized formatting utilities
 * Re-exports all formatting functions for easy importing
 */

// Date formatting
export {
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatDateForDisplay,
  formatMonth,
  formatDayWithWeekday,
  toDateInputValue,
  fromDateInputValue,
  getTodayInputValue,
  toDBDateValue,
  fromDBDateValue
} from './date';

// Currency formatting
export {
  formatCurrency,
  formatNumber,
  formatCompactCurrency
} from './currency';

// Percentage formatting
export {
  formatPercentage,
  formatPercentageFromDecimal,
  formatPercentageFromWhole
} from './percentage';
