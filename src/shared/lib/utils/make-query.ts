export const parseQueryParam = <T extends { id: string }>(
  list: readonly T[],
  fallback: T['id'],
  raw?: string | string[]
): T['id'] => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return fallback;

  const exists = list.some((item) => item.id === value);
  return (exists ? value : fallback) as T['id'];
};
