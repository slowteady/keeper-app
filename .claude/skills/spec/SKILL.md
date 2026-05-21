---
name: spec
description: PRD 와 design 이 끝난 기능의 데이터 모델·백엔드 영향·프론트 API 흐름·스키마 3중 검증을 명세화한다. 사용자가 /spec 입력 시, 또는 "스펙 만들어줘 / 데이터 모델 확정 / 백엔드 영향 정리 / 마이그레이션 짜자" 같이 design → 구현 사이의 기술 명세 단계로 옮길 때 무조건 사용. 산출물은 docs/spec/<feature>.md. 다음 단계는 /be (백엔드 구현) → /fe (프론트 구현) → /qa (검증).
---

# /spec — 데이터·백엔드·API 기술 명세

design 산출물(UI 설계)을 입력으로 받아 **데이터 흐름과 백엔드 영향을 변경 명세
수준까지** 확정. 산출물은 `docs/spec/<feature>.md`.

UI 설계는 다루지 않는다 (`/design` 의 책임).
실제 코드 변경은 다루지 않는다 (`/implement` 의 책임 — 이 문서는 변경 명세만).

## 분리 원칙 — 메인 vs 서브에이전트

기준 한 줄: **사용자와 대화가 필요한가**.

spec 은 결정·검증 비중이 압도적이라 메인 ping-pong 중심. 서브 위임은
keeper-api 다중 파일 훑기 1건만.

- **메인이 직접** — PRD/design 로드, Data Model 확정, 프론트 API 흐름 설계,
  스키마 3중 검증, 테스트 시나리오 추출, 산출물 작성
- **서브 위임** — `keeper-api/src/api/<domain>/` 다중 파일 훑기 (Backend
  Impact 정리 단계). `feature-researcher` mode: context 재활용

## 절차 (순서대로)

### 1. 입력 확정

- `docs/prd/<feature>.md` 와 `docs/design/<feature>.md` 둘 다 입력
- 둘 중 하나라도 없으면 선행 스킬(`/prd` 또는 `/design`) 먼저 돌리라고 안내

### 2. PRD + design 로드

메인이 직접 두 파일 읽는다 (각 1개라 부담 적음).

머릿속에 정리:

- PRD 에서 — Goals/Non-Goals, Functional Requirements (P0/P1/P2)
- design 에서 — 화면 목록, 컴포넌트 매핑, FSD 슬라이스 배치

### 3. Data Model 확정 + 사용자 컨펌

PRD 의 "Data Model 초안" 을 DDL 직전 수준까지 확정.

각 컬럼 결정:

- 타입 / 길이 (예: VARCHAR(40))
- nullable 여부 — **명시적으로**
- UNIQUE / 복합 UNIQUE
- 기본값 (DEFAULT NOW(6) / NULL / 등)
- FK 정책 (`ON DELETE CASCADE / SET NULL / RESTRICT`)
- 인덱스 (조회 패턴 기반)

PII / 익명화 정책 영향 있는 컬럼 (예: email, tel) 은 hard delete 정책과의
호환성 확인. 결정 후 사용자 컨펌.

### 4. Backend Impact 정리 — `feature-researcher` 위임 (mode: context)

`keeper-api` 영향 파악을 위해 서브에 위임. 메인 컨텍스트 보호.

```
Agent(subagent_type="feature-researcher",
  description="keeper-api 영향 조사",
  prompt="mode: context

  새 기능 키워드: <domain>

  훑을 영역 한정:
  - keeper-api/docs/migrations/ (마지막 번호, 비슷한 도메인 SQL)
  - keeper-api/docs/<domain>-*.md (정책 문서)
  - keeper-api/src/api/<domain>/entity/ (현재 스키마)
  - keeper-api/src/api/<domain>/controller·service/ (변경 대상)
  - keeper-api/src/api/<domain>/type/ (현재 DTO)")
```

받은 3줄 요약으로 다음을 채움:

- **마이그레이션 번호 예약** — 현재 마지막 + 1 (정확히 박음)
- **DDL 개요** — CREATE TABLE / ALTER 한 줄 요약
- **변경 controller·service 파일** — 어느 파일의 어느 메서드
- **DTO 변경** — Request/Response 클래스명 + 추가/변경 필드

코드 수정 X — 변경 명세만 박는다.

### 5. 프론트 API 호출 흐름 설계

design 의 FSD 슬라이스 배치를 기준으로:

- **queryKey 구조** — `<domain>Queries.list()` / `.detail(id)` factory 패턴
- **useQuery / useMutation 정의 위치** — 보통 `src/entities/<domain>/api.ts`
  또는 `src/features/<domain>/model/`
- **mutationFn** — 어느 api 함수 호출
- **캐시 invalidation** — mutation 성공 시 어떤 queryKey 무효화
- **에러 처리** — interceptor 영향, 도메인 예외(BaseException) 매핑

### 6. 스키마 3중 검증

keeper 핵심 룰 (`feedback_schema_validation`). 표 형태로:

```
| 필드 | frontend zod | backend DTO | DB column | 일치 여부 |
```

불일치 발견 시 — 어느 쪽을 맞출지 결정 (보통 DB → DTO → zod 순서로 정합).

추가 작업 항목 명시.

### 7. 테스트 시나리오 추출

PRD 의 P0 요구사항 + design 의 화면 흐름 기반:

- **P0 시나리오** — Given-When-Then 형태. 다음 `/implement` 단계의 TDD 입력
- **엣지 케이스** — 동시성 / validation 실패 / FK 위반 / 인증 만료 / 빈 응답 /
  네트워크 에러 등

사용자에게 한 번 컨펌.

### 8. 모호하면 → 검색 먼저, 그래도 안 풀리면 사용자 피드백

`/feature` `/prd` `/design` 과 같은 룰.

### 9. 산출물 작성

`docs/spec/<feature>.md` 신규 파일. 파일명은 PRD/design 과 동일 kebab-case.

템플릿은 `references/spec-template.md` 참조. 채울 때:

- Data Model 확정값은 "TBD" 없이 — 명세 단계에서 확정해야 구현 단계가 막힘 없음
- 스키마 3중 검증 표 비워두지 말 것
- ADR 에 "왜 NULL 아닌 NOT NULL" 같은 미세 결정 사유까지 — 미래 검증의 정보

## 안티패턴 (왜 안 하는지)

- **design 없이 바로 spec**: UI 슬라이스 배치 없이 API hook 위치를 결정 못 함.
  design → spec 순서가 BP.
- **Data Model TBD 로 남기기**: 명세 단계 끝나면 다음(구현)이 명세 그대로
  코드화. TBD 면 구현 단계에서 다시 결정 회의 → 두 번 일.
- **스키마 3중 검증 생략**: keeper 의 가장 자주 깨지는 결합점. nullable /
  optional / 길이 / 빈 문자열 같은 불일치가 운영 버그로 직결.
- **실제 코드 수정**: spec 은 명세만. 코드는 `/implement` 단계.
- **keeper-api docs/code 메인이 직접 다 읽기**: 다중 파일이라 메인 컨텍스트
  낭비. `feature-researcher mode: context` 위임.
- **테스트 시나리오 추출 생략**: 구현 단계에서 PRD/design 다시 봐야. 명세
  단계에서 한 번에 정리.
- **마이그레이션 번호 충돌**: keeper-api 현재 마지막 번호 확인 안 하고 박으면
  머지 시 번호 충돌. 정확히 +1 예약.
