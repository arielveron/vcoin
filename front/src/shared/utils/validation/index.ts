/**
 * Validation utilities
 * Re-exports all validation functions for easy importing
 */

export type {
  ValidationRule,
  FieldValidation
} from './forms';

export {
  required,
  minLength,
  maxLength,
  email,
  number,
  positiveNumber,
  validateField,
  validateForm
} from './forms';

export {
  studentValidationSchema,
  investmentValidationSchema,
  classValidationSchema,
  interestRateValidationSchema
} from './schemas';
