# 테스트 가이드

## TDD 절차

1. RED — 실패하는 테스트 먼저 작성
2. GREEN — 테스트 통과하는 최소 구현
3. REFACTOR — 코드 정리 (테스트는 계속 통과)

## 테스트 피라미드

| 레벨      | 도구        | 대상                          | 비율 |
| --------- | ----------- | ----------------------------- | ---- |
| Unit      | Jest        | hook, 유틸, mapper, 순수 함수 | 70%  |
| Component | Jest + RNTL | UI 컴포넌트 렌더링, 인터랙션  | 20%  |
| E2E       | Maestro     | 핵심 사용자 플로우            | 10%  |

## Unit 테스트

- features/model/ hook — 비즈니스 로직 검증
- shared/model/hooks — 범용 hook 검증
- entities/mapper — 데이터 변환 순수 함수 검증
- shared/lib/utils — 유틸 함수 검증

## Component 테스트

- @testing-library/react-native (RNTL) 사용
- 렌더링 결과 검증 (텍스트, 요소 존재 여부)
- 사용자 인터랙션 시뮬레이션 (press, input)
- props 변경에 따른 UI 변화 검증

## E2E 테스트

- Maestro 사용 (YAML 기반)
- 핵심 사용자 플로우 — `.maestro/flows-<platform>/` 참조
- iOS/Android 동일 스크립트

## 파일 위치

- 소스 파일 옆에 co-location
- `use-adopt-list.ts` → `use-adopt-list.test.ts`

## 테스트 유틸

- `src/test/create-wrapper.tsx` — QueryClientProvider 래퍼
- `renderHook(() => useXxx(), { wrapper: createWrapper() })`

## 검증 항목

- flat 반환 검증 (state, data, actions 등 그룹핑 키 없음)
- 함수 타입 검증 (typeof result.current.xxx === 'function')
- 기본값, 경계값, 에러 시나리오 검증

## Mock

- expo-router: useLocalSearchParams, useRouter mock
- 외부 라이브러리: jest.mock으로 모듈 단위 mock
- API 응답: createWrapper로 QueryClient 제공

## 실행

- 전체: `npx jest`
- 단일: `npx jest <파일경로>`
- 수정 후 반드시 전체 테스트 통과 확인
