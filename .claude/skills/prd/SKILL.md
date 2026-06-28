---
name: prd
description: 발산이 끝난 백로그(docs/backlog/<feature>.md)를 합의 가능한 PRD 로 수렴·구체화. 사용자가 /prd 입력 시, 또는 "PRD 만들어줘 / 요구사항 정리해줘 / 이 백로그 PRD화" 같이 발산 결과를 명세 단계로 옮길 때 무조건 사용. 산출물은 docs/prd/<feature>.md. 다음 단계는 /design (UI 설계) — 구현 계획·코드 작성 단계 아님.
---

# /prd — 백로그 → 제품 요구사항 문서

발산(`/feature`) 산출물을 사용자/이해관계자가 합의할 수 있는 명확한
요구사항으로 변환. 산출물은 `docs/prd/<feature>.md`.

## 분리 원칙 — 메인 vs 서브에이전트

기준 한 줄: **사용자와 대화가 필요한가**.

PRD 는 발산보다 **사용자 ping-pong 비중이 압도적**이라 거의 메인이 직접.
서브 위임이 의미 있는 경우는 한정적.

- **메인이 직접** — 백로그 정착본 로드, 섹션별 ping-pong, 결정 기록, 산출물 작성
- **서브 위임** — keeper-api docs 다중 파일 훑기, 추가 레퍼런스 보완 검색만
  `feature-researcher` 재활용 (mode: context 또는 mode: reference)

서브에 던질 때는 좁은 출력 강제.

## 절차 (순서대로)

### 1. 입력 백로그 확정

사용자에게 PRD 화할 백로그 파일을 묻거나, 대화 흐름에서 명확하면 그대로 확정.

- `docs/backlog/<feature>.md` 가 입력. 없으면 `/feature` 먼저 돌리라고 안내
- 백로그 상태가 "아이디어 발산" 단계면 사용자에게 "확정 단계로 옮겨도 되나"
  먼저 컨펌

### 2. 백로그 로드

메인이 직접 백로그 정착본을 읽는다. 파일 1~2 개라 raw 인용 부담 적음.

읽고 머릿속에 정리: **배경 / 전략축 / 선행조건 / 컷한 옵션 / 오픈 이슈**.

### 3. 섹션별 사용자 ping-pong (10 섹션)

PRD 의 10 섹션을 순서대로 채운다. 각 섹션마다:

1. 백로그에서 추출 가능한 부분은 메인이 초안 작성
2. 결정 필요한 부분은 사용자에게 좁은 질문
3. 사용자 답이 와야 다음 섹션으로

10 섹션 구조와 채우는 법은 `references/prd-template.md` 참조.

**Problem before solution** 원칙 — 2(Problem) / 3(Goals·Non-Goals) 가
6(Functional Requirements) 보다 먼저. 문제 충분히 정의 안 되면 요구사항으로
넘어가지 않는다.

**Non-Goals 비우지 말 것** — "이번에 안 함"이 "함"만큼 중요. 백로그 "컷한
옵션" 을 발전시켜 채운다.

### 4. 모호하면 → 검색 먼저, 그래도 안 풀리면 사용자 피드백

`/feature` 와 같은 룰. 검색이 가능한 질문(외부 BP·라이브러리·UI 패턴)은
WebSearch/context7 로 먼저 풀고, 사용자에게는 keeper 정체성·우선순위·가치
판단만 던진다.

레퍼런스 추가 조사가 필요하면 `feature-researcher` mode: reference 재활용.

### 5. Backend Impact 정리 (필요 시)

DB/DTO 영향 있는 기능이면 `keeper-api/docs/<domain>-*.md` 와
`keeper-api/src/api/<domain>/` 를 훑어 현재 스키마 / 마이그레이션 번호 파악.

다중 파일 훑기가 필요하면 `feature-researcher` mode: context 재활용
(prompt 에 "keeper-api 영역 한정" 명시).

- 마이그레이션 번호 예약: 현재 마지막 번호 + 1
- DTO 영향: 어느 controller/service 가 변경 대상인지 파일 단위 명시
- 코드 수정은 PRD 단계 아님 — 영향 범위만 명시

### 6. 산출물 작성

`docs/prd/<feature>.md` 신규 파일. 파일명은 백로그와 동일하게 kebab-case
(예: `event-curation.md`).

템플릿은 `references/prd-template.md` 참조. 채울 때:

- 비어두기보다 "TBD — 사용자 결정 대기" 로 명시
- ADR 섹션은 **컷한 옵션 + 사유** 까지 — 미래에 다시 끄집어내지 않게
- 백로그 원본은 그대로 보존 (PRD 가 백로그 대체 아님 — 단계 진행)

작성 끝나면 `docs/backlog/product-roadmap.md` 와 어떻게 연결될지는 사용자에게
짧게 보고만. **product-roadmap.md 임의 수정 금지** (우선순위는 별도 단계).

## 안티패턴 (왜 안 하는지)

- **백로그 없이 바로 PRD 작성**: 발산 단계 검증 없이 수렴하면 컷됐어야 할
  옵션이 PRD 에 박힌다. 발산 → 수렴 순서가 BP 인 이유.
- **Problem 섹션 건너뛰고 Functional Requirements 부터**: 문제 정의가 약하면
  요구사항은 자의적이 된다. Modern PRD 의 핵심 원칙.
- **Non-Goals 비워두기**: 스코프 컷팅은 1인 운영의 생명선. 비우면 무한 확장.
- **검색 가능한 질문을 사용자에게 던지기**: 사용자 이중작업 방지 — 검색이
  가능한지 자문 후 던질 것.
- **PRD 단계에서 코드 수정**: 영향 범위만 명시. 코드는 `/writing-plans` /
  `/executing-plans` 단계.
- **product-roadmap.md 임의 수정**: 우선순위는 횡단 비교. PRD 한 건이 다른
  기능 우선순위 바꿀 권한 없음.
- **백로그 정착본 삭제**: PRD 가 백로그 대체 아님. 백로그는 발산 기록으로
  보존, PRD 는 수렴 산출.
