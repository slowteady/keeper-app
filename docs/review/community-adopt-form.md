# Review 보고서 — community-adopt-form

## 1. 메타

- 작성일: 2026-06-10
- 검수 대상: feature/community 브랜치 현재 working-tree 변경분 (미커밋)
- 검수 단계: 문서 / 코드 컨벤션 / BP 정합 / silent failure
- 입력 명세:
  - Backlog: docs/backlog/features/00-community-adopt-mvp.md
  - Spec: docs/spec/community-write-form-bp.md (기존 누적), docs/spec/community-write-modal.md
  - QA: docs/qa/community-write-form-bp.md (기존)
  - PRD·Design 파일 없음 (이번 사이클은 backlog → 직접 구현)

---

## 2. 문서 완결성·일관성

| 문서                             | 완결성 | 일관성 | traceability | ADR | 상태                                                 |
| -------------------------------- | ------ | ------ | ------------ | --- | ---------------------------------------------------- |
| Backlog `00-community-adopt-mvp` | ⚠️     | ✅     | —            | ⚠️  | specialMark 제거 반영, 폼 필드 목록 업데이트 필요    |
| PRD                              | ❌     | —      | —            | —   | 이번 사이클에 PRD 없이 backlog 직접 구현             |
| Design                           | ❌     | —      | —            | —   | 없음                                                 |
| Spec `community-write-form-bp`   | ⚠️     | ✅     | ✅           | ✅  | relatedLink URL 검증 추가·contact optional 반영 필요 |
| QA `community-write-form-bp`     | ⚠️     | ✅     | ✅           | ✅  | contact optional 변경 후 스펙 정합 재확인 필요       |

### 문서 발견 사항

| #   | 등급 | 위치                                   | 항목                                                                              |
| --- | ---- | -------------------------------------- | --------------------------------------------------------------------------------- |
| 1   | P1   | backlog/00-community-adopt-mvp.md §2-2 | specialMark 제거 미반영 (폼 필드 목록에 `likes/dislikes/specialMark` 여전히 언급) |
| 2   | P1   | backlog/00-community-adopt-mvp.md §2-2 | contact optional 변경 미반영 (필수 5개 목록이 contact 포함 기술)                  |
| 3   | P1   | spec 없음                              | relatedLink URL 검증 + maxLength(500) 결정이 spec에 미기록                        |
| 4   | P2   | backlog/00-community-adopt-mvp.md §3   | convertToAdoptDetailBehaviorData (성격·행동 상세 표시) 미구현 상태 미기록         |

---

## 3. 코드 컨벤션 검수 (pr-review-toolkit:code-reviewer 결과)

### 컨벤션 정합 영역

| 룰                                                                    | 상태 |
| --------------------------------------------------------------------- | ---- |
| CLAUDE.md (커밋 금지 · 추측 금지 · 주석 금지)                         | ✅   |
| code-conventions.md (타입 · export · hook · 컴포넌트 · 스타일 · 상수) | ✅   |
| api-patterns.md (query/mutation factory · 스키마 · select · 인터셉터) | ✅   |
| project-structure.md (FSD 슬라이스 · Container Hook)                  | ✅   |
| tsc/jest/eslint 검증                                                  | ✅   |

### 코드 발견 사항

| #   | 등급 | 위치 (file:line)                                                               | 항목                                                                                            | 처리                                              |
| --- | ---- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1   | P1   | entities/community/schema.ts:18,31                                             | stale 주석 (필수 6·선택 9 카운트 — contact optional 변경 후 잘못된 수치)                        | ✅ 이번 사이클 fix 완료                           |
| 2   | P1   | features/community/detail/model/mapper.ts:49                                   | `convertToAdoptDetailBehaviorData` exported but not used in any UI — 성격·행동 상세 표시 미구현 | 의도적 보류 (백엔드 저장만, 상세 표시 P1 backlog) |
| 3   | P2   | widgets/community-adopt-feed-section/ui/community-adopt-form.tsx               | 섹션 번호 주석 (① ② ③ ④ ⑤) CLAUDE.md 위반                                                       | ✅ 이번 사이클 fix 완료                           |
| 4   | P2   | widgets/community-adopt-feed-section/ui/community-adopt-form.tsx:activityLevel | `activityLevel` LabelChipGroup에 `stretch` prop 없음 — 다른 칩그룹과 불일치                     | 다음 사이클 보강                                  |

---

## 4. 외부 BP 정합

| 영역                        | 채택한 BP                                                                             | 외부 BP 정합 | 출처                                                         |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| Required field in accordion | 필수 필드는 항상 노출 (accordion 밖 공고정보 섹션)                                    | ✅           | NN/g "accordion visibility" + Baymard progressive disclosure |
| Contact optional            | 연락처 0개 허용 (문의하기 버튼 게이팅으로 대체)                                       | ✅           | backlog P0-2 (PIPC 권고 — 직접 노출 지양)                    |
| relatedLink URL 검증        | `z.union([url().max(500), literal('')])` — 빈 문자열·유효 URL만 허용                  | ✅           | zod 공식 docs — union 패턴 BP                                |
| 성격·행동 enum 태그         | toiletTraining / separationAnxiety / barking / activityLevel / withChildren,Dogs,Cats | ✅           | Petfinder API, KARA 척도, 핌피 실측 (backlog §2-1)           |

### BP 발견 사항

없음 — P0/P1/P2 모두 없음.

---

## 5. 선택 검수

### silent failure (pr-review-toolkit:silent-failure-hunter)

| #   | 등급     | 위치                                        | 항목                                                                                   | 처리 결정                                                                               |
| --- | -------- | ------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | (→ 기각) | features/community/create/model/api.ts:50   | contacts 배열에 empty value 항목이 포함될 경우 그대로 전송 — 필터 없음                 | zod `.trim().min(1)` 이 form submit 전 차단. CLAUDE.md "불가능한 경우 검증 금지" — 기각 |
| 2   | P1       | features/community/create/model/api.ts      | `relatedLink` orUndefined 처리 — 빈 문자열이 `undefined`로 변환되어 백엔드 전달 여부   | 현재 동작 의도적 (빈 문자열 = 미입력). 백엔드 null 처리 확인 필요                       |
| 3   | P2       | features/community/detail/model/mapper.ts:9 | `detailPost.user?.image ?? ''` — image 빈 문자열이 UI에서 fallback avatar로 처리되는지 | 의도적 fallback (UI 에서 빈 image → 기본 아바타 표시)                                   |

### 타입 디자인 (pr-review-toolkit:type-design-analyzer)

이번 사이클 신규 타입 없음 — skip.

### 주석 정확성 (pr-review-toolkit:comment-analyzer)

주석 제거 위주 변경 — 정확성 이슈 없음 (CLAUDE.md 준수). skip.

---

## 6. 종합 발견 사항

### P0 (사이클 종료 전 fix 필수)

없음 — P0 잔존 없음. 사이클 종료 가능.

### P1 (fix 권장)

| #   | 영역 | 위치                                         | 항목                                                                           | 처리                                                                |
| --- | ---- | -------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 1   | 문서 | backlog/00-community-adopt-mvp.md §2-2       | specialMark 제거 + contact optional 변경 미반영                                | ✅ 2026-06-11 코드 기준 전면 반영 완료 (§2-2·§2-3·§3-3)             |
| 2   | 문서 | spec 파일 없음                               | relatedLink URL 검증 + maxLength 결정 미기록                                   | 다음 사이클 spec 보강                                               |
| 3   | 코드 | features/community/detail/model/mapper.ts:49 | `convertToAdoptDetailBehaviorData` UI 미연결 — 성격·행동 상세 표시 미구현 보류 | ⬆️ 2026-06-11 **P0 승격** — 상세 표시 구현 예정 (backlog §3-3 반영) |
| 4   | 코드 | features/community/create/model/api.ts       | `relatedLink` 빈 문자열 → undefined 변환 → 백엔드 null 처리 확인 필요          | 백엔드 API 연동 시 검증                                             |

### P2 (다음 사이클 보강)

| #   | 영역 | 위치                                                  | 항목                                           |
| --- | ---- | ----------------------------------------------------- | ---------------------------------------------- |
| 1   | 코드 | community-adopt-form.tsx activityLevel LabelChipGroup | `stretch` prop 누락 — 다른 chip group과 불일치 |
| 2   | 문서 | backlog/00-community-adopt-mvp.md §3                  | ✅ 2026-06-11 §3-3에 구현상태(⏳/✅) 명시 완료 |
| 3   | 코드 | detail/model/mapper.ts:9                              | user image 빈 문자열 fallback — UI 확인        |

---

## 7. ADR

| 결정                             | 옵션                                             | 채택           | 사유                                                               |
| -------------------------------- | ------------------------------------------------ | -------------- | ------------------------------------------------------------------ |
| contact 필수 → 선택              | (A) min(1) 유지, (B) 선택(empty array 허용)      | (B) 선택       | P0-2 PIPC 권고 — 직접 노출 지양. 문의하기 버튼 게이팅으로 대체     |
| specialMark 제거                 | (A) 개인입양에만 제거, (B) 전체 제거             | (A) 개인입양만 | 공공 유기동물 데이터에는 특징 필드 유지 필요                       |
| relatedLink 검증                 | (A) url()만, (B) union(url, literal(''))         | (B)            | 빈 문자열은 미입력 상태 — url() 단독이면 빈 제출 불가              |
| 필수 필드 accordion 밖 배치      | (A) accordion 안 (접힘), (B) 항상 노출           | (B)            | NN/g + Baymard: required field는 항상 visible 해야 제출 오류 예방  |
| convertToAdoptDetailBehaviorData | (A) 미사용 → 삭제, (B) 백엔드 저장만 · 표시 보류 | (B) 보류       | 데이터 저장은 완료, 상세 표시 UI는 P1으로 분리. 함수·테스트는 유지 |

---

## 8. 다음 사이클 보강 영역

- backlog/00-community-adopt-mvp.md 필드 목록 + contact optional 반영 업데이트
- 성격·행동 상세 표시(convertToAdoptDetailBehaviorData) UI 연결 — detail screen 보강
- activityLevel chip group `stretch` prop 통일
- P0-3 신고 버튼 / P0-4 면책·안전 고지 배너 구현 (출시 전 필수)

---

## 9. 영향 파일 (이번 사이클)

### keeper-app (미커밋)

- `src/entities/community/schema.ts` — specialMark 제거, contact min(1) 제거, relatedLink URL 검증 추가, stale 주석 제거
- `src/entities/community/schema.test.ts` — contact optional 테스트 수정
- `src/entities/community/constant.ts` — (chip 옵션 추가)
- `src/features/community/create/model/api.ts` — specialMark 제거
- `src/features/community/create/model/api.test.ts` — specialMark 픽스처 제거
- `src/features/community/create/model/use-create-post.tsx` — defaultValues contact:[] 변경
- `src/features/community/create/ui/field/contact-select-field.tsx` — 0개 허용 guard 제거
- `src/features/community/create/ui/field/label-chip-group.tsx` — (chip 개선)
- `src/features/community/detail/model/mapper.ts` — specialMark 제거
- `src/features/community/detail/model/mapper.test.ts` — specialMark 픽스처 제거
- `src/features/community/edit/lib/from-detail.ts` — specialMark 제거
- `src/features/community/edit/lib/from-detail.test.ts` — specialMark 픽스처 제거
- `src/features/community/edit/model/use-edit-post.test.tsx` — specialMark 픽스처 제거
- `src/widgets/community-adopt-feed-section/ui/community-adopt-form.tsx` — 폼 재구조화 (animalType 이동, 섹션 accordion 분리, 섹션 주석 제거)
- `src/widgets/community-adopt-feed-section/ui/community-detail-description-section.tsx` — specialMark 표시 제거
- `src/app/(untabs)/community/[id]/index.tsx` — (연동 수정)
- `src/shared/ui/button/chip-button.tsx` — (공유 컴포넌트 개선)
- `src/shared/ui/data-display/chip-group.tsx` — (공유 컴포넌트 개선)
