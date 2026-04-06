/**
 * 전화번호 형식 검증 및 정제
 * - null이거나 빈 문자열인 경우 null 반환
 * - 별표(*)나 특수문자만 있는 경우 null 반환
 * - 숫자만 추출하여 유효한 길이(9-11자리)인지 확인
 * - 괄호가 포함된 경우 괄호 이전 부분만 추출 (예: "02-1234-5678 (내선: 1234)")
 */
export const validateAndSanitizeTel = (tel: string | null): string | null => {
  if (!tel || tel.trim() === '') return null;

  const trimmed = tel.trim();

  if (/^[*\-()\s]+$/.test(trimmed)) return null;

  // 괄호가 있으면 괄호 이전 부분만 추출
  const main = trimmed.includes('(') ? trimmed.split('(')[0].trim() : trimmed;

  const digits = main.replace(/[^0-9]/g, '');

  if (digits.length < 9 || digits.length > 11) return null;

  return main;
};
