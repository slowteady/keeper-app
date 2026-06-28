import { FieldErrors, FieldValues } from 'react-hook-form';

export const getFormErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') return undefined;

  if ('message' in error && typeof error.message === 'string') return error.message;

  for (const value of Object.values(error)) {
    const message = getFormErrorMessage(value);
    if (message) return message;
  }

  return undefined;
};

export const findFirstFieldError = <T extends FieldValues>(
  errors: FieldErrors<T>,
  order: (keyof T)[]
): { name: keyof T; message: string } | null => {
  for (const name of order) {
    const message = getFormErrorMessage((errors as Record<keyof T, unknown>)[name]);
    if (message) return { name, message };
  }
  return null;
};
