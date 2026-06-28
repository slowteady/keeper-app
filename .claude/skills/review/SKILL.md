---
name: review
description: 이번 사이클의 PRD/design/spec/qa 문서 완결성·일관성 + 코드 컨벤션 (CLAUDE.md / code-conventions.md / api-patterns.md) 준수 + 이번 작업 영역의 외부 BP 정합 종합 검수. 사용자가 /review 입력 시, 또는 "리뷰해줘 / 컨벤션 체크 / 문서 검수 / BP 확인 / 사이클 마무리 정합" 같이 /qa 다음 사이클 종료 직전 정합성 확인 시 무조건 사용.
---

# /review — 사이클 종료 정합 검수

`/qa` 다음 단계. 사이클 동안 작성된 **문서**(PRD/design/spec/qa) + **코드** 의
컨벤션·일관성·외부 BP 정합을 종합 검수. 자동 테스트와 명세 정합성은 /qa 영역,
/review 는 그 위의 **품질** 영역.

산출물은 `docs/review/<feature 또는 cycle>.md`.

## /qa 와의 차이

| 영역                                 | /qa                | /review                           |
| ------------------------------------ | ------------------ | --------------------------------- |
| 명세 ↔ 코드 정합                     | ✅ qa-auditor      | (참고만)                          |
| 자동 테스트                          | ✅ tsc/jest/eslint | (참고만)                          |
| 위험 모듈 회귀                       | ✅ qa-auditor      | (참고만)                          |
| MCP 시뮬 (UX)                        | ✅ 메인 직접       | ❌                                |
| **문서 완결성·일관성**               | ❌                 | ✅ 메인 직접                      |
| **코드 컨벤션 (CLAUDE.md 등)**       | ❌                 | ✅ code-reviewer 위임             |
| **외부 BP 정합**                     | ❌                 | ✅ 메인 직접 (WebSearch/context7) |
| **silent failure / 타입 invariants** | ❌                 | ✅ 선택 위임                      |

→ /qa = 명세 정합 + 회귀. /review = **품질·일관성·BP**.

## 분리 원칙 — 메인 vs 서브에이전트

기준 한 줄: **컨벤션 판단인가, 종합 판단인가**.

- **메인이 직접** — 문서 완결성·일관성 검수, BP 조사 (WebSearch/context7),
  사용자 종합 보고, 산출물 작성
- **서브 위임** — 코드 컨벤션·silent failure·타입·주석 영역
  - `pr-review-toolkit:code-reviewer` (필수) — CLAUDE.md / code-conventions.md / api-patterns.md 준수
  - `pr-review-toolkit:silent-failure-hunter` (선택) — try/catch · fallback · silent undefined 영역
  - `pr-review-toolkit:type-design-analyzer` (선택) — 신규 타입 invariants · encapsulation
  - `pr-review-toolkit:comment-analyzer` (선택) — 주석 정확성 · tech debt

서브 결과는 P0/P1/P2 등급으로 받아 메인이 종합 판단.

## 절차 (순서대로)

### 1. 입력 확정

- 검수 대상 = 사이클 (commit 범위) 또는 특정 기능
- 이번 사이클 commits 추출 — `git log --oneline <base>..HEAD` 양쪽 repo
- 사이클의 PRD/design/spec/qa 문서 list 확인
- /qa 끝났는지 확인 — 안 끝났으면 /qa 먼저 안내

### 2. 문서 완결성·일관성 검수 (메인 직접)

다음 4 문서 종류를 직접 읽고 검수:

- `docs/prd/<feature>.md` — Problem / Goals · Non-Goals / Functional Requirements / ADR / Open Issues 채워졌는지
- `docs/design/<feature>.md` — 화면별 컴포넌트 트리 / FSD 슬라이스 배치 / 재활용·신규 사유 / ADR 채워졌는지
- `docs/spec/<feature>.md` — Data Model 확정값 (TBD 없음) / Backend Impact / 스키마 3중 검증표 / 테스트 시나리오 / ADR 채워졌는지
- `docs/qa/<feature>.md` — 위험 모듈 / 명세 정합성 / 자동 테스트 / P0~P2 처리 이력 / ADR 채워졌는지

검수 기준:

- **완결성**: 각 문서의 필수 섹션이 비어있지 않은지 (TBD / 비어 있음 / "추후" 등)
- **일관성**: PRD ↔ design ↔ spec ↔ qa 의 결정이 일관된지 (예: PRD 에서 컷한 옵션이 spec 에 다시 등장 X)
- **Trace ability**: 각 문서가 직전 단계 문서를 입력으로 명시했는지 (PRD → design → spec → qa 의 연쇄 참조)
- **ADR 채워짐**: 미세 결정 사유까지 박혔는지

발견 사항 P0/P1/P2 분류:

- **P0** — 명세 모순 / 결정 미확정 / 다음 사이클에 막힘 발생
- **P1** — 일관성 미세 / 누락된 ADR
- **P2** — 표현·포맷·정렬

### 3. 코드 컨벤션 검수 — `pr-review-toolkit:code-reviewer` 위임 (필수)

```
Agent(subagent_type="pr-review-toolkit:code-reviewer",
  description="이번 사이클 코드 컨벤션 검수",
  prompt="대상: git diff <base>..HEAD (keeper-app + keeper-api 양쪽)

  핵심 룰 (CLAUDE.md / docs/code-conventions.md / docs/api-patterns.md /
  docs/project-structure.md):
  - 커밋 금지 (사용자 명시 전)
  - 추측 절대 금지 — context7 / WebSearch 사용
  - 쓸데없는 주석 금지 — JSDoc / 워크어라운드 메모 / 섹션 구분
  - tsc + jest + eslint 검증 통과
  - FSD 슬라이스 구조 (entities / features / widgets / shared / app)
  - Container Hook 패턴
  - query/mutation factory 패턴 (entities/<domain>/api.ts)
  - zod schema 3중 검증 (DB ↔ DTO ↔ frontend)

  발견 사항을 P0/P1/P2 등급 + 위치(file:line)로 표 형태. raw 인용 X.")
```

### 4. 추가 검수 (선택, 영역 따라)

#### 4-1. silent failure 영역이 있나?

이번 사이클에 try/catch / fallback / silent undefined 가능 영역 있으면:

```
Agent(subagent_type="pr-review-toolkit:silent-failure-hunter",
  description="silent failure 검수",
  prompt="대상: git diff <base>..HEAD
  중점 영역: <try/catch · fallback · ConfigService non-null · ?? default>
  발견 사항 P0/P1/P2 등급으로.")
```

#### 4-2. 신규 타입·entity·DTO 가 있나?

```
Agent(subagent_type="pr-review-toolkit:type-design-analyzer",
  description="신규 타입 검수",
  prompt="대상 타입: <new entity / DTO / zod schema list>
  검수: encapsulation · invariants · usefulness · enforcement")
```

#### 4-3. 주석·문서 변경 큰 PR 인가?

```
Agent(subagent_type="pr-review-toolkit:comment-analyzer",
  description="주석 정확성 검수",
  prompt="대상: git diff <base>..HEAD 의 주석·docstring 변경")
```

### 5. 외부 BP 정합 검수 (메인 직접)

이번 사이클 작업 영역의 **외부 BP 와 정합** 확인. CLAUDE.md 룰: "추측 절대 금지, BP 탐색".

영역 별:

- **신규 라이브러리·SDK 도입** — context7 으로 공식 docs 확인
- **새 기능 패턴** — WebSearch 로 비슷한 서비스 BP 확인
- **AWS/인프라 영역** — AWS Docs / 공식 BP 패턴 확인

이미 spec/design 단계에 박힌 BP 결정과 비교 — 정합 여부 검수.

발견 사항 P0/P1/P2.

### 6. 발견 사항 종합

3개 영역 (문서·코드·BP) + 선택 영역의 P0/P1/P2 통합:

- **P0** — 사이클 종료 전 fix 필수 (다음 사이클 막힘)
- **P1** — fix 권장 (품질 ↑, 후속 PR OK)
- **P2** — 다음 사이클 보강 또는 백로그

### 7. 사용자 보고

P0 는 즉시 보고 + 처리 결정. P1/P2 는 산출물에 정리, 사용자에게 요약만.

P0 미해결 상태로 review 완료 처리 금지.

### 8. 산출물 작성

`docs/review/<feature 또는 cycle>.md` 신규. 템플릿은 `references/review-template.md` 참조.

기능별 review 이력 누적 — 같은 기능 재검수 시 이전 review 위에 갱신 (날짜·상태 추가).

## 안티패턴 (왜 안 하는지)

- **/qa 와 중복 검수**: /qa 는 명세 정합 + 자동 테스트, /review 는 컨벤션·문서·BP. 중복 영역 (정합성·자동 테스트) 반복 호출 X — /qa 결과를 참고만
- **문서 검수 생략**: 문서 정합 안 되면 다음 사이클 의사결정 오염. PRD 의 컷한 옵션이 spec 에 다시 등장하면 곧 갈아엎음
- **code-reviewer 위임 안 하고 메인이 컨벤션 일일이 확인**: 메인 컨텍스트 낭비. 검증된 서브에 위임
- **BP 조사 skip**: keeper CLAUDE.md 룰 "추측 절대 금지". spec/design 단계 BP 가 실제 외부 BP 와 정합 안 되면 사이클 처음부터 잘못 박힌 결정
- **선택 위임 (silent-failure-hunter / type-design-analyzer) 무조건 호출**: 작업 영역에 해당 영역 변경 없으면 시간 낭비. 영역 확인 후 호출
- **위반 사항 없음 단정**: 항상 P0/P1/P2 분류. 없으면 "P0 없음 / P1 N건 / P2 N건" 명시
- **P0 미해결 채로 review 완료**: P0 = 사이클 종료 전 필수. 잔존 P0 가 있으면 review 실패 처리
