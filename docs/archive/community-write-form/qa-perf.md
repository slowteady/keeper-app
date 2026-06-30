# QA — 커뮤니티 작성/수정 페이지 perf fix

**일시**: 2026-05-21
**범위**: `community-adopt-form.tsx` 의 `form.watch` → `useWatch` 마이그레이션

## 배경

사용자 보고 — 쓰기 페이지가 조금 버벅거리는 느낌.

## Root cause

`src/widgets/community-adopt-feed-section/ui/community-adopt-form.tsx` 가 `form.watch('animalType')` / `form.watch('specificType')` 사용 → react-hook-form 의 `watch` 는 **어떤 필드든 변경되면 form 전체 컴포넌트 리렌더** 트리거. 키 입력 한 글자마다 15+ 필드 + Accordion + ImageSelector 까지 리렌더.

## Fix

| 라인 | Before                                        | After                                                              |
| ---- | --------------------------------------------- | ------------------------------------------------------------------ |
| 40   | `const animalType = form.watch('animalType')` | `const animalType = useWatch({ control, name: 'animalType' })`     |
| 신규 | —                                             | `const specificType = useWatch({ control, name: 'specificType' })` |
| 91   | `value={form.watch('specificType')}`          | `value={specificType}`                                             |

`useWatch` 는 명시 필드만 구독 → 다른 필드 변경 시 해당 컴포넌트만 리렌더. RHF 공식 권장 패턴.

## 자동 테스트

| 검사                   | 결과                         |
| ---------------------- | ---------------------------- |
| tsc                    | PASS                         |
| eslint                 | PASS                         |
| jest                   | PASS (72 suites / 432 tests) |
| use-edit-post.test.tsx | PASS (27 tests 포함)         |

## MCP 시뮬 검수

| 시나리오                                                                             | 결과                                           |
| ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| animalType 변경 시 `isOtherAnimalType` 분기 — LabelTextField ↔ LabelSelectField 토글 | ✅ "기타" 선택 시 자유입력 필드 노출           |
| specificType prefill (edit 화면 가정)                                                | ✅ useWatch 가 defaultValues 첫 렌더 동기 반환 |
| 품종 자유입력 — onChange ↔ value 양방향                                              | ✅ "X" 입력 후 화면 즉시 반영                  |
| 회귀 — 다른 필드 / Accordion / ImageSelector                                         | ✅ 정상 렌더                                   |

## 발견 사항

| 심각도 | 내용                                                                                                   | 조치                               |
| ------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| P0     | 없음                                                                                                   | —                                  |
| P1     | 없음                                                                                                   | —                                  |
| P2     | `LabelTextField` 가 `field.value` 대신 외부 `value` prop 만 TextField 에 전달 — controlled 일관성 약함 | 본 변경과 무관, 후속 리팩토링 후보 |
| P2     | 주석 2줄 제거 — 의도는 commit 메시지로                                                                 | 컨벤션 부합                        |

## 종합

P0/P1 없음. **QA 통과**.

체감 perf 개선 측정은 시뮬 단일 캡처로 어려움 — 사용자 직접 입력 테스트 영역.

## Fix 이력

- 2026-05-21 — 쓰기 페이지 입력 시 form 전체 리렌더 / `form.watch` → `useWatch` 두 곳 / `community-adopt-form.tsx:40,91`
