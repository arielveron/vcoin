/**
 * Form validation utilities
 * Centralized validation functions for forms
 */

import { ValidationError } from '../errors';

export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidation {
  field: string;
  rules: ValidationRule<unknown>[];
}

export const required = (message = 'Este campo es obligatorio'): ValidationRule<unknown> => ({
  validate: (value: unknown) => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  },
  message
});

export const minLength = (min: number, message?: string): ValidationRule<unknown> => ({
  validate: (value: unknown) => {
    if (typeof value !== 'string') return false;
    return value.length >= min;
  },
  message: message || `Debe tener al menos ${min} caracteres`
});

export const maxLength = (max: number, message?: string): ValidationRule<unknown> => ({
  validate: (value: unknown) => {
    if (typeof value !== 'string') return false;
    return value.length <= max;
  },
  message: message || `No puede tener más de ${max} caracteres`
});

export const email = (message = 'El formato del email no es válido'): ValidationRule<unknown> => ({
  validate: (value: unknown) => {
    if (typeof value !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  message
});

export const number = (message = 'Debe ingresar un número válido'): ValidationRule<unknown> => ({
  validate: (value: unknown) => !isNaN(Number(value)),
  message
});

export const positiveNumber = (message = 'Debe ingresar un número positivo'): ValidationRule<unknown> => ({
  validate: (value: unknown) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },
  message
});

export const validateField = (field: string, value: unknown, rules: ValidationRule<unknown>[]): void => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      throw new ValidationError(field, 'VALIDATION_FAILED', rule.message);
    }
  }
};

export const validateForm = (data: Record<string, unknown>, validations: FieldValidation[]): void => {
  for (const { field, rules } of validations) {
    validateField(field, data[field], rules);
  }
};
