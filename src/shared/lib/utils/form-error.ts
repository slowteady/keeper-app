export const getFormErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') return undefined;

  if ('message' in error && typeof error.message === 'string') return error.message;

  for (const value of Object.values(error)) {
    const message = getFormErrorMessage(value);
    if (message) return message;
  }

  return undefined;
};
