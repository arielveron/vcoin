/**
 * Validation schemas
 * Predefined validation schemas for common entities
 */

import { FieldValidation, required, minLength, maxLength, email, positiveNumber } from './forms';

export const studentValidationSchema: FieldValidation[] = [
  {
    field: 'nombre',
    rules: [required(), minLength(2), maxLength(100)]
  },
  {
    field: 'apellido', 
    rules: [required(), minLength(2), maxLength(100)]
  },
  {
    field: 'dni',
    rules: [required(), minLength(7), maxLength(8)]
  },
  {
    field: 'email',
    rules: [required(), email()]
  }
];

export const investmentValidationSchema: FieldValidation[] = [
  {
    field: 'monto',
    rules: [required(), positiveNumber()]
  },
  {
    field: 'concepto',
    rules: [required(), minLength(3), maxLength(200)]
  }
];

export const classValidationSchema: FieldValidation[] = [
  {
    field: 'name',
    rules: [required(), minLength(3), maxLength(100)]
  },
  {
    field: 'current_monthly_interest_rate',
    rules: [required(), positiveNumber()]
  }
];

export const interestRateValidationSchema: FieldValidation[] = [
  {
    field: 'monthly_rate',
    rules: [required(), positiveNumber()]
  },
  {
    field: 'description',
    rules: [maxLength(200)]
  }
];
