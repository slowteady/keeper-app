---
name: fe
description: spec + design 을 입력 받아 keeper-app 코드로 구현한다. zod 스키마 → 비즈니스 로직 → UI 순서. 사용자가 /fe 입력 시, 또는 "프론트 구현 / 화면 만들자 / 이 spec 코드화" 같이 spec·design → 프론트 코드 단계로 옮길 때 무조건 사용. 백엔드 코드는 /be 책임. 다음 단계는 /qa (검증). TDD 사이클은 superpowers /test-driven-development 에 위임 — 이 스킬은 keeper-app 특화 흐름만 다룬다.
---

# /fe — keeper-app 구현

`docs/spec/<feature>.md` 와 `docs/design/<feature>.md` 를 입력 받아 keeper-app
코드로 옮긴다. 각 구현 단계마다 superpowers TDD 사이클 invoke.

산출물은 코드 (실제 keeper-app 파일들).

## 분리 원칙 — 메인 vs 서브에이전트

기준 한 줄: **사용자와 대화가 필요한가**.

구현은 결정·검증·TDD 사이클 ping-pong 핵심. 서브 위임은 keeper-app 패턴
훑기 1건만.

- **메인이 직접** — spec/design 로드, TDD 사이클(superpowers 위임 포함),
  코드 구현, 검증, MCP 시뮬 검수
- **서브 위임** — keeper-app 현재 패턴 훑기 (1단계). `feature-researcher`
  mode: context 재활용

## 절차 (순서대로)

### 1. 맥락 이해

다음을 모두 로드 (대량 파일은 서브 위임):

**메인 직접**:

- `docs/spec/<feature>.md` — 입력 명세
- `docs/design/<feature>.md` — UI 매핑
- `docs/project-structure.md` — FSD 레이어, 슬라이스 구조, Container Hook
- `docs/code-conventions.md` — 타입, export, hook, 컴포넌트, 스타일, 상수
- `docs/api-patterns.md` — query/mutation factory, 스키마, select, 인터셉터
- `docs/testing.md` — TDD 절차, mock 패턴
- `.claude/skills/design/references/library-catalog.md` — 서드파티 컴포넌트
  (헛돌이 방지 마지막 게이트)

**서브 위임** — 비슷한 도메인 슬라이스가 어떻게 짜여 있는지:

```
Agent(subagent_type="feature-researcher",
  description="keeper-app 패턴 조사",
  prompt="mode: context

  새 기능 키워드: <domain>

  훑을 영역 한정:
  - src/entities/<related-domain>/ (schema / api / mapper / ui)
  - src/features/<related-domain>/ (model / ui)
  - src/widgets/<related-domain>/
  - src/app/<related-route>/

  중점: 비슷한 도메인의 슬라이스 구성 / hook 패턴 / queryKey factory /
  에러 처리 / UI 컴포지션 한 줄 요약")
```

### 2. zod 스키마 생성 — TDD

`src/entities/<domain>/schema.ts` 작성. spec 의 스키마 3중 검증 결정 따름.

TDD 사이클 invoke:

```
Skill(skill="superpowers:test-driven-development")
```

각 사이클:

- RED — `schema.test.ts` 에 한 케이스 (valid / invalid 경계) 추가
- GREEN — `z.object({ ... })` 최소 정의
- REFACTOR — 공통 schema 추출 (필요 시)

검증: `npx jest src/entities/<domain>/schema.test.ts`

### 3. 비즈니스 로직 구현 — TDD

순서대로:

1. **`entities/<domain>/api.ts`** — axios 호출. spec 의 엔드포인트와 매칭
2. **`entities/<domain>/mapper.ts`** — DTO ↔ FE 모델 변환 (필요 시)
3. **`features/<domain>/model/use-*.ts`** — `useQuery` / `useMutation` 정의.
   spec 의 queryKey / mutationFn / 캐시 invalidation 그대로

각 파일마다 superpowers TDD 사이클. test 파일은 같은 위치에 `*.test.ts`.

검증: `npx jest src/entities/<domain>/ src/features/<domain>/`

### 4. UI 구현 — TDD

design 의 컴포넌트 매핑 그대로:

1. **`features/<domain>/ui/`** — 모달 / 시트 / 폼 등 도메인 기능 UI
2. **`widgets/<domain>/ui/`** — 큰 section 컴포넌트
3. **`app/<route>/`** — 페이지 라우트

각 컴포넌트마다 superpowers TDD 사이클. RNTL 로 test.

신규 컴포넌트 작성 전 **library-catalog.md 다시 확인** — 서드파티에 있는데
직접 짜는 헛돌이 마지막 게이트.

검증: `npx jest src/features/<domain>/ src/widgets/<domain>/`

### 5. 검증

`keeper-app` 루트에서:

```bash
npx tsc --noEmit          # 타입 검증
npx jest                   # 전체 테스트
npx eslint src/            # 린트
```

세 가지 모두 통과 후 **MCP 시뮬 검수**:

- Maestro MCP 로 실제 시뮬레이터/기기에서 화면 흐름 직접 검증
- 새 .maestro flow 추가 필요 시 `.maestro/flows-<platform>/<feature>.yaml` 작성
- 시뮬 결과 raw 화면 확인 → 회귀·UX 어색함 직접 봄

실패 시:

- tsc / jest / eslint 에러 — spec/design 명세와 어긋난 부분 확인
- MCP 시뮬 어색함 — design 으로 돌아가 컨펌 받고 갱신

## 안티패턴 (왜 안 하는지)

- **spec 또는 design 없이 구현 시작**: 둘 다 입력. 한쪽 없으면 결정 부족.
- **spec/design 무시하고 자체 결정**: 명세를 코드에서 바꾸면 어긋남. 모호하면
  spec/design 갱신부터.
- **TDD 사이클 자체 재구현**: superpowers 위임. RED/GREEN 재설명 X.
- **library-catalog 안 보고 신규 컴포넌트 작성**: 헛돌이의 주범. 4단계 시작
  전 다시 확인.
- **검증 실패 무시 / 워크어라운드**: 회귀 신호. spec/design 으로 돌아감.
- **MCP 검수 생략**: 코드 검증만으로 UX 어색함 못 잡음. 시뮬에서 직접 봐야.
- **keeper-app 컨벤션 깨기**: FSD 슬라이스 구조 / Container Hook / api-patterns
  임의 변경 금지. 비슷한 도메인 패턴 그대로 따라.
