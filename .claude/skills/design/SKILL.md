---
name: design
description: PRD 가 확정된 기능을 UI 설계로 옮긴다. 화면 목록 / 컴포넌트 트리 / 재활용 vs 신규 / FSD 프론트 슬라이스 매핑까지. 사용자가 /design 입력 시, 또는 "이 기능 화면 짜자 / UI 설계 / 컴포넌트 어떻게 배치" 같이 PRD → 화면·컴포넌트 결정 단계로 옮길 때 무조건 사용. 데이터 모델·백엔드 변경은 다음 단계 /spec 책임.
---

# /design — UI 설계

PRD 의 요구사항을 화면 / 컴포넌트 트리 / 슬라이스 배치 까지 구체화.
산출물은 `docs/design/<feature>.md`.

데이터 모델·백엔드 설계는 다루지 않는다 (`/spec` 의 책임).

## 분리 원칙 — 메인 vs 서브에이전트

기준 한 줄: **사용자와 대화가 필요한가**.

design 은 결정 연쇄가 큼 (어떤 컴포넌트 재활용 → 어느 슬라이스에 둘지) → 메인
ping-pong 비중 압도적. 서브 위임은 외부 UI BP 검색 1건만.

- **메인이 직접** — PRD 로드, Figma 데이터 분석, 컴포넌트 카탈로그 훑기,
  FSD 슬라이스 매핑, 사용자 컨펌, 산출물 작성
- **서브 위임** — Case B 의 외부 UI 배치 BP 검색만. `feature-researcher`
  mode: reference 재활용

## 절차 (순서대로)

### 1. 입력 확정

- `docs/prd/<feature>.md` 가 입력. 없으면 `/prd` 먼저 돌리라고 안내
- Figma URL 유무 확인 — 사용자에게 묻거나 PRD 메타에서 추출
- Figma URL **있음** → Case A, **없음** → Case B 로 분기

### 2-A. Case A — Figma 데이터 분석

`mcp__figma__get_figma_data` 로 노드 데이터 fetch. 화면별:

- 레이아웃 트리 파악
- 사용된 컴포넌트 식별 (Figma 컴포넌트명 ↔ keeper 컴포넌트 매핑 후보)
- 새로 만들어야 할 컴포넌트 추출

Figma 데이터가 클 경우 화면당 한 번씩 fetch (한 번에 전체 X).

### 2-B. Case B — 컴포넌트 카탈로그 + 외부 UI BP

Figma 없으니 기존 자산 + 외부 BP 로 화면 조립.

**1) 컴포넌트 카탈로그 (메인 직접)**

매번 헛돌이 방지를 위해 다음을 훑는다:

- `references/library-catalog.md` — keeper 자주 쓰는 서드파티 라이브러리와
  핵심 export. 한 번 보면 "키보드 따라 올라가는 footer = KeyboardStickyView"
  같은 매칭 빠름
- `src/shared/ui/**/index.ts` — 공용 컴포넌트
- `src/features/*/ui/index.ts` — 도메인 무관하게 재활용되는 모달/시트 등
- `src/entities/*/ui/index.ts` — 비슷한 도메인 entity UI 가 있으면 패턴 참고

**2) 외부 UI 배치 BP — `feature-researcher mode: reference` 위임**

```
Agent(subagent_type="feature-researcher",
  description="UI 배치 BP 조사",
  prompt="mode: reference

  아이디어: <화면 유형 + 기능 — 예: '글 작성 폼, 이미지 첨부 + 카테고리 선택'>
  관심사: UI 배치 패턴 (어떤 컴포넌트가 어디에, 어떤 순서로)")
```

도메인 발산 BP 조사가 아닌 **UI 배치 BP** 라고 명시해야 적절한 패턴이 옴.

### 3. UI 설계 — 화면별 컴포넌트 트리

화면마다 다음을 결정:

- 컴포넌트 트리 (어떤 컴포넌트가 어떤 순서로 쌓이는지)
- 각 컴포넌트의 **출처** — `shared/ui` / `features/<x>` / `entities/<x>` /
  서드파티(라이브러리명) / 신규 (새로 만들 것)
- 신규 컴포넌트는 **왜 신규인지** (기존 재활용 불가 사유)

사용자에게 화면 단위로 컨펌 받는다. 한 번에 전체 던지지 말고 화면별 ping-pong.

### 4. FSD 프론트 슬라이스 매핑

각 신규 컴포넌트가 어느 슬라이스에 들어갈지:

- `shared/ui/<category>/` — 도메인 무관 공용 (Button 류)
- `entities/<domain>/ui/` — 도메인 데이터 표시 UI (카드/헤더 류)
- `features/<domain>/ui/` — 한 기능 단위 UI (모달/시트/폼 류)
- `widgets/<domain>/ui/` — 화면 영역 컴포넌트 (큰 section 류)
- `app/<route>/` — 페이지/라우트

배치 결정 후 사용자 컨펌.

### 5. 모호하면 → 검색 먼저, 그래도 안 풀리면 사용자 피드백

`/feature` `/prd` 와 같은 룰.

- 검색 가능한 질문(컴포넌트 패턴·라이브러리 사용법·UI BP)은 WebSearch/context7
  으로 먼저
- 사용자에게는 디자인 톤·우선순위·재활용 의도 같은 판단 질문만

### 6. 산출물 작성

`docs/design/<feature>.md` 신규 파일. 파일명은 PRD 와 동일 kebab-case.

템플릿은 `references/design-template.md` 참조. 채울 때:

- 컴포넌트 매핑 표는 출처·용도·재활용 여부 다 채울 것
- 신규 컴포넌트는 슬라이스 위치까지 명시
- "왜 신규" 사유는 미래에 다시 끄집어내지 않게 명확히

## 안티패턴 (왜 안 하는지)

- **서드파티 안 보고 직접 구현**: 이미 라이브러리에 있는 컴포넌트를 새로 짜면
  헛돌이. library-catalog.md 부터 본다.
- **PRD 없이 바로 화면부터**: 요구사항 정의 없이 화면 그리면 자의적. PRD →
  design 순서가 BP.
- **데이터 모델·백엔드까지 같이 결정**: 결정 결이 다름. design 은 UI 만,
  데이터·BE 는 `/spec`.
- **검색 가능한 질문을 사용자에게 던지기**: 사용자 이중작업 방지.
- **신규 컴포넌트 사유 비워두기**: "왜 재활용 못 했는지" 가 미래의 재활용
  판단 정보.
- **한 번에 전체 화면 던지기**: 화면별 컨펌 안 받으면 후반에 갈아엎어야.
  화면 단위 ping-pong.
