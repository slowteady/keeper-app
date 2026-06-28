export const validateAndSanitizeTel = (tel: string | null): string | null => {
  if (!tel || tel.trim() === '') return null;

  const trimmed = tel.trim();

  if (/^[*\-()\s]+$/.test(trimmed)) return null;

  const main = trimmed.includes('(') ? trimmed.split('(')[0].trim() : trimmed;

  const digits = main.replace(/[^0-9]/g, '');

  if (digits.length < 9 || digits.length > 11) return null;

  return main;
};
