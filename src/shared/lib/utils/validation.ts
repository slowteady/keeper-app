/**
 * 전화번호 형식 검증 및 정제
 * - null이거나 빈 문자열인 경우 null 반환
 * - 별표(*)나 특수문자만 있는 경우 null 반환
 * - 숫자만 추출하여 유효한 길이(9-11자리)인지 확인
 * - 하이픈이 포함된 경우 형식 확인
 */
export const validateAndSanitizeTel = (tel: string | null): string | null => {
  if (!tel || tel.trim() === '') {
    return null;
  }

  const trimmedTel = tel.trim();

  // 별표나 특수문자만 있는 경우 검증 (예: ***********, ***-****-****)
  const hasOnlySpecialChars = /^[*\-()\s]+$/.test(trimmedTel);
  if (hasOnlySpecialChars) {
    return null;
  }

  // 숫자만 추출
  const digitsOnly = trimmedTel.replace(/[^0-9]/g, '');

  // 숫자가 없는 경우
  if (digitsOnly.length === 0) {
    return null;
  }

  // 한국 전화번호 유효 길이: 9자리(지역번호 2자리) ~ 11자리(휴대폰)
  if (digitsOnly.length < 9 || digitsOnly.length > 11) {
    return null;
  }

  // 지번이 있는 경우 처리 (예: "02-1234-5678 (내선: 1234)")
  // 지번 부분을 제거하고 메인 전화번호만 반환
  const mainTelMatch = trimmedTel.match(/^([^\(]+)/);
  if (mainTelMatch) {
    const mainTel = mainTelMatch[1].trim();
    const mainTelDigits = mainTel.replace(/[^0-9]/g, '');

    // 메인 전화번호가 유효한지 확인
    if (mainTelDigits.length >= 9 && mainTelDigits.length <= 11) {
      return mainTel;
    }
    // 유효하지 않으면 null 반환
    return null;
  }

  // 지번이 없는 경우, 이미 숫자 길이 검증을 통과했으므로 유효한 번호로 간주하여 반환
  // 모든 검증을 통과한 경우에만 여기까지 도달
  return trimmedTel;
};
