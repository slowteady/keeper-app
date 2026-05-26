// 백엔드 presigned 미구현 시점의 임시 dev mock — 백엔드 완료 후 본 파일 제거
// 개발 빌드 (__DEV__) 에서만 활성. 운영 빌드 / jest 는 자동 OFF.
export const IS_MOCK_UPLOAD = __DEV__ && typeof jest === 'undefined';

// 이미지 추가 버튼 탭 1회당 다음 항목 1개씩 폼에 append
export const MOCK_DOG_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `https://picsum.photos/seed/keeper-dog-${i + 1}/600/400`
);
