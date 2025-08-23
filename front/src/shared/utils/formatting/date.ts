/**
 * Date formatting utilities
 * Centralized date formatting to ensure consistency across the application
 */

/**
 * Safely parse a date ensuring it's interpreted in local timezone
 * Handles PostgreSQL DATE fields that might come as strings
 */
export const normalizeDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date;
  }
  
  // If it's a YYYY-MM-DD string (PostgreSQL DATE format), parse in local timezone
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  }
  
  // For other formats, use standard parsing
  return new Date(date);
};

export const formatDate = (date: Date | string, locale = 'es-AR'): string => {
  const d = normalizeDate(date);
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateTime = (date: Date | string, locale = 'es-AR'): string => {
  const d = normalizeDate(date);
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatTimeAgo = (date: Date | string): string => {
  const d = normalizeDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  
  return formatDate(d);
};

/**
 * Convert a date string or Date object to YYYY-MM-DD format for HTML date inputs
 * Handles timezone conversion to avoid date shifting
 */
export const toDateInputValue = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Use local date parts to avoid timezone issues
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convert a YYYY-MM-DD date input value to a Date object in local timezone
 * Avoids timezone shifting when creating Date from input
 */
export const fromDateInputValue = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Get today's date in YYYY-MM-DD format for date inputs
 */
export const getTodayInputValue = (): string => {
  return toDateInputValue(new Date());
};

/**
 * Format date for database storage (ISO string)
 * Ensures consistent timezone handling
 */
export const toDBDateValue = (date: Date | string): string => {
  const d = typeof date === 'string' ? fromDateInputValue(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Format date for display, handling YYYY-MM-DD input strings correctly
 * Avoids timezone issues when displaying dates from form inputs
 */
export const formatDateForDisplay = (date: Date | string, locale = 'es-AR'): string => {
  let d: Date;
  
  if (typeof date === 'string') {
    // If it's a YYYY-MM-DD string from date input, parse it in local timezone
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      d = fromDateInputValue(date);
    } else {
      d = new Date(date);
    }
  } else {
    d = date;
  }
  
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Parse database date string to local Date object
 */
export const fromDBDateValue = (dateString: string): Date => {
  return fromDateInputValue(dateString);
};

/**
 * Compare two dates for equality (date part only, ignoring time)
 * Handles Date objects, ISO strings, and YYYY-MM-DD strings consistently
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns true if dates are the same day
 */
export const isSameDate = (date1: Date | string, date2: Date | string): boolean => {
  return toDBDateValue(date1) === toDBDateValue(date2);
};

/**
 * Format month and year for grouping (e.g., "agosto 2025")
 * Used for organizing investments by month in lists
 */
export const formatMonth = (date: Date | string, locale = 'es-AR'): string => {
  const d = normalizeDate(date);
  return d.toLocaleDateString(locale, { year: "numeric", month: "long" });
};

/**
 * Format date with weekday for user-friendly display (e.g., "mié 15 ago")
 * Used for showing dates in a compact, readable format
 */
export const formatDayWithWeekday = (date: Date | string, locale = 'es-AR'): string => {
  const d = normalizeDate(date);
  return d.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric", 
    month: "short",
  });
};
