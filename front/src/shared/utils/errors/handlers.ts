/**
 * Error handling utilities
 * Centralized error handling and messaging system
 */

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export class BusinessError extends Error {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends Error {
  public readonly field: string;
  public readonly code: string;

  constructor(field: string, code: string, message: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

export const createAppError = (code: string, message: string, details?: unknown): AppError => ({
  code,
  message,
  details
});

export const isAppError = (error: unknown): error is AppError => {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
};

export const isBusinessError = (error: unknown): error is BusinessError => {
  return error instanceof BusinessError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};
