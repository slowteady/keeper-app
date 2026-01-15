export const makeQueryString = (params: Record<string, any>) => {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
};

/**
 * 쿼리 파라미터 값 safety 파싱
 * @param list - 목록 데이터
 * @param fallback - 기본값
 * @param raw - 쿼리 파라미터
 * @returns 쿼리 파라미터 값
 */
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
