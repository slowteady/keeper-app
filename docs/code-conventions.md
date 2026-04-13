# 코딩 컨벤션

## 타입

- type 사용 (interface는 라이브러리 extends만)
- as 타입 단언 최소화, instanceof 타입 가드 우선
- any 금지, unknown 사용
- 함수 파라미터 nullable은 타입에 명시 (string | null)

## Export

- named export (default export는 Expo Router 파일만)
- 내부 전용 서브컴포넌트/타입은 export 금지

## Hook

- flat 객체 반환 (그룹핑 금지)
- 불필요한 useCallback/useMemo 금지
- setter 네이밍: setIsXxx (isSetXxx 금지)
- execute prefix 금지 → 동사 그대로 (refresh, login)
- async 함수 호출 시 await 누락 금지

## 컴포넌트

- RN 기본값 명시 금지 (display: 'flex')
- dead code, 미사용 export 즉시 제거
- 인라인 스타일 반복 → StyleSheet 또는 styled로 추출

## 스타일

- 색상은 Tamagui 토큰 사용 (하드코딩 hex 금지)
- 그림자: Tamagui styled 안에서는 boxShadow, StyleSheet에서는 Platform.select

## 상수

- makeXxxOption 헬퍼 함수 금지 → OBJECT.KEY 직접 접근
- 중복 상수 통합
- as const 누락 금지
