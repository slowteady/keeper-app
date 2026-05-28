# Review 산출물 템플릿

`docs/review/<feature 또는 cycle>.md` 형식.

```markdown
# Review 보고서 — <feature 또는 cycle 명>

## 1. 메타

- 작성일: YYYY-MM-DD
- 검수 대상: <commit 범위 또는 기능명>
- 검수 단계: 문서 / 코드 컨벤션 / BP 정합 (+ 선택: silent failure / 타입 / 주석)
- 입력 명세:
  - PRD: docs/prd/...
  - Design: docs/design/...
  - Spec: docs/spec/...
  - QA: docs/qa/...

## 2. 문서 완결성·일관성

| 문서            | 완결성   | 일관성   | trace ability | ADR      | 상태   |
| --------------- | -------- | -------- | ------------- | -------- | ------ |
| PRD `<file>`    | ✅/⚠️/❌ | ✅/⚠️/❌ | ✅/⚠️/❌      | ✅/⚠️/❌ | (요약) |
| Design `<file>` |          |          |               |          |        |
| Spec `<file>`   |          |          |               |          |        |
| QA `<file>`     |          |          |               |          |        |

### 문서 발견 사항

| #   | 등급     | 위치            | 항목         |
| --- | -------- | --------------- | ------------ |
| 1   | P0/P1/P2 | <doc>:<section> | <한 줄 요약> |

## 3. 코드 컨벤션 검수 (pr-review-toolkit:code-reviewer 결과)

### 컨벤션 정합 영역

| 룰                                                                    | 상태     |
| --------------------------------------------------------------------- | -------- |
| CLAUDE.md (커밋 금지 · 추측 금지 · 주석 금지)                         | ✅/⚠️/❌ |
| code-conventions.md (타입 · export · hook · 컴포넌트 · 스타일 · 상수) | ✅/⚠️/❌ |
| api-patterns.md (query/mutation factory · 스키마 · select · 인터셉터) | ✅/⚠️/❌ |
| project-structure.md (FSD 슬라이스 · Container Hook)                  | ✅/⚠️/❌ |
| tsc/jest/eslint 검증                                                  | ✅/⚠️/❌ |

### 코드 발견 사항

| #   | 등급     | 위치 (file:line) | 항목         |
| --- | -------- | ---------------- | ------------ |
| 1   | P0/P1/P2 | <file>:<line>    | <한 줄 요약> |

## 4. 외부 BP 정합

이번 사이클 작업 영역의 외부 BP 와 정합 여부 (WebSearch / context7 결과 기반).

| 영역   | 채택한 BP      | 외부 BP 정합 | 출처                              |
| ------ | -------------- | ------------ | --------------------------------- |
| <영역> | <spec 의 결정> | ✅/⚠️/❌     | <URL 또는 context7 라이브러리 ID> |

### BP 발견 사항

| #   | 등급     | 영역   | 항목                |
| --- | -------- | ------ | ------------------- |
| 1   | P0/P1/P2 | <영역> | <한 줄 요약 + 출처> |

## 5. 선택 검수 (영역 따라)

### silent failure (pr-review-toolkit:silent-failure-hunter)

영역 변경 있을 때만. 결과:

| #   | 등급 | 위치 | 항목 |
| --- | ---- | ---- | ---- |

### 타입 디자인 (pr-review-toolkit:type-design-analyzer)

신규 entity·DTO·zod schema 있을 때만. 결과:

| 타입 | encapsulation | invariants | usefulness | enforcement |
| ---- | ------------- | ---------- | ---------- | ----------- |

### 주석 정확성 (pr-review-toolkit:comment-analyzer)

주석·문서 변경 큰 PR 때만. 결과:

| #   | 등급 | 위치 | 항목 |
| --- | ---- | ---- | ---- |

## 6. 종합 발견 사항

3개 (+ 선택) 영역의 P0/P1/P2 통합.

### P0 (사이클 종료 전 fix 필수)

| #   | 영역         | 위치   | 항목    | 처리                        |
| --- | ------------ | ------ | ------- | --------------------------- |
| 1   | 문서/코드/BP | <위치> | <한 줄> | <fix commit 또는 보류 사유> |

### P1 (fix 권장)

| #   | 영역 | 위치 | 항목 | 처리 |
| --- | ---- | ---- | ---- | ---- |

### P2 (다음 사이클 보강)

| #   | 영역 | 위치 | 항목 |
| --- | ---- | ---- | ---- |

## 7. ADR

| 결정 | 옵션 | 채택 | 사유 |
| ---- | ---- | ---- | ---- |

## 8. 다음 사이클 보강 영역

- <한 줄>
- <한 줄>

## 9. 영향 commits

이번 사이클 commit 목록 (이번 review fix commit 포함):

### keeper-api

- <hash> <subject>

### keeper-app

- <hash> <subject>
```

## 채울 때 BP

- 각 문서 영역의 "✅/⚠️/❌" 단정 단정 X — 어느 영역이 어떻게 누락인지 한 줄로 채울 것
- P0 가 잔존하면 "사이클 종료 미완" 명시 (fix 안 한 채로 review 완료 처리 금지)
- BP 정합 영역의 출처 URL 또는 context7 라이브러리 ID 명시 (미래 재검증의 출처)
- 선택 검수 영역에 변경 없으면 "변경 없음 — skip" 명시 (조사 자체를 안 한 게 명확하도록)
