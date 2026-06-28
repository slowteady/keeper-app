---
name: fix
description: 수동 QA 또는 사용자 지적으로 발견된 이슈를 root cause 기반으로 해결한다. MCP 재현 → BP 검색 → 영향 범위 → 컨벤션 / library-catalog 재확인 → 회귀 방지 테스트 → 검증 순. 사용자가 /fix 입력 시, 또는 "이거 안 되네 / 이 버그 잡아 / 이슈 fix / 이거 왜 이래" 같이 발견된 이슈를 처리할 때 무조건 사용. 명세 영향 큰 fix 는 /spec 또는 /design 재진입 안내.
---

# /fix — 발견 이슈 해결

수동 QA 또는 사용자 지적 → root cause 파악 → fix → 회귀 방지.
산출물은 코드 (+ 같은 기능의 `docs/qa/<feature>.md` 가 있으면 fix 이력 append).

## 분리 원칙 — 메인 vs 서브에이전트

기준 한 줄: **사용자와 대화가 필요한가**.

fix 는 결정·재현·검증 ping-pong 핵심. 서브 위임은 영향 범위 분석 1건만.

- **메인이 직접** — 재현 (MCP), BP 검색, 원인 결정, 코드 수정, 검증
- **서브 위임** — 영향 범위·기존 패턴·library-catalog 매칭. `feature-researcher`
  mode: context 재활용

## 절차 (순서대로)

### 1. 재현 (MCP)

추측으로 시작 금지. 사용자 지적을 MCP 시뮬로 직접 재현하여 정확한 증상 확인.

- iOS / Android 둘 다 재현 시도 (플랫폼 의존인지 가르기)
- 재현 안 되면 사용자에게 환경·시나리오 한 번 더 확인

### 2. 원인 root cause + BP 검색

증상 fix 가 아닌 근원 fix. 추측 금지:

- 코드 흐름 추적 — 어디서 잘못된 값/상태/타이밍이 생기는지
- **BP 검색**:
  - WebSearch — 같은 증상의 알려진 패턴·해결법
  - context7 — 사용 중인 라이브러리에 대한 권장 사용법
  - `references/library-catalog.md` (`design/references/`) — **서드파티에 해결책
    있는지 다시 확인** (헛돌이 방지의 마지막 게이트)
- 기존 keeper 코드에 비슷한 이슈를 어떻게 풀었는지 — 일관 패턴이 BP

### 3. 영향 범위 평가 — `feature-researcher` 위임 (mode: context)

같은 원인이 다른 슬라이스에도 있는지 확인. 한 곳 fix 하고 다른 곳 회귀로
다시 터지는 거 방지.

```
Agent(subagent_type="feature-researcher",
  description="fix 영향 범위 조사",
  prompt="mode: context

  이슈 키워드: <한 줄>
  원인 추정: <한 줄>

  훑을 영역: 같은 원인 패턴이 있을 수 있는 슬라이스
  - src/<관련 슬라이스>/
  - 비슷한 도메인의 features / entities

  중점: 같은 패턴 존재 여부 / 영향 범위 한 줄 요약")
```

### 4. 명세 영향 판단

fix 가 spec / design / PRD 명세를 바꾸나? 분기:

- **작은 fix** (명세 영향 X) — 이 스킬 안에서 처리
- **큰 fix** (명세 영향 있음) — 사용자에게 보고 후 `/spec` 또는 `/design`
  재진입 안내. 이 스킬 종료

큰 fix 를 명세 갱신 없이 코드만 바꾸면 명세 ↔ 코드 어긋남.

### 5. 회귀 방지 테스트 (TDD)

같은 이슈가 다시 안 생기게 실패 테스트 먼저:

- 단위 테스트 — bug 재현 케이스를 it 으로
- (UI 이슈면) Maestro flow 추가 또는 기존 flow 보강

`Skill(skill="superpowers:test-driven-development")` invoke — RED 확인 후 GREEN.

### 6. fix 구현

명세 영향 없는 경우만 (4단계 분기). spec/design 의 결정 그대로 유지하며 root
cause 만 제거.

keeper 컨벤션 준수:

- FSD 슬라이스 / Container Hook
- api-patterns (query/mutation factory, interceptor, 에러 처리)
- code-conventions
- 서드파티 사용 (library-catalog) — 직접 짜기 전 라이브러리 export 다시 확인

### 7. 검증

- `npx tsc --noEmit` (관련 레포)
- `npx jest` — 5단계의 회귀 테스트 + 전체 회귀
- `npx eslint src/` (keeper-app)
- **MCP 재검수** — 1단계 재현 시나리오가 이제 통과하는지 확인. 다른 화면 어색함도
  체크

### 8. 산출물 / 이력

같은 기능의 `docs/qa/<feature>.md` 가 있으면 "Fix 이력" 섹션 append:

```
## Fix 이력
- YYYY-MM-DD — <한 줄 증상> / <한 줄 원인> / <fix 위치 file:line>
```

QA 문서 없는 단발 fix 면 별도 파일 안 만들고 commit 메시지로 충분.

## 안티패턴

- **재현 없이 코드 수정**: 추측 fix 는 다른 문제 만들거나 원인 안 잡힘.
- **증상만 fix**: 같은 원인이 다른 데서 또 터짐. root cause 찾는 게 핵심.
- **library-catalog 안 보고 직접 구현**: 헛돌이의 주범. 2단계에서 반드시 확인.
- **영향 범위 평가 생략**: 같은 패턴 다른 슬라이스에 회귀 잠복.
- **명세 영향 큰 fix 를 이 스킬에서 강행**: 명세 ↔ 코드 어긋남. `/spec` 또는
  `/design` 재진입 안내가 BP.
- **회귀 테스트 생략**: 같은 이슈가 다음 사이클에서 다시 터짐. TDD 강제.
- **MCP 재검수 생략**: tsc/jest 통과해도 UX 어색함은 시뮬에서만 잡힘.
