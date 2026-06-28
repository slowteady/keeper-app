---
name: be
description: spec 의 Backend Impact 를 keeper-api 코드로 구현한다. 마이그레이션 / entity / DTO / controller / service / spec 테스트까지. 사용자가 /be 입력 시, 또는 "백엔드 구현 / API 만들자 / 마이그레이션 작업 / DTO 추가" 같이 spec → 백엔드 코드 단계로 옮길 때 무조건 사용. 다음 단계는 /fe (프론트 구현) → /qa (검증). TDD 사이클은 superpowers /test-driven-development 에 위임 — 이 스킬은 keeper-api 특화 흐름만 다룬다.
---

# /be — keeper-api 구현

`docs/spec/<feature>.md` 의 Backend Impact 명세를 keeper-api 코드로 구현.
TDD 사이클 자체는 superpowers 위임, keeper-api 특화(마이그레이션·FSD·BaseException·
컨벤션)만 이 스킬에서 다룬다.

산출물은 코드 (실제 keeper-api 파일들).

## 분리 원칙 — 메인 vs 서브에이전트

기준 한 줄: **사용자와 대화가 필요한가**.

구현은 결정·검증·TDD 사이클 ping-pong 핵심. 서브 위임은 keeper-api 패턴
훑기 1건만.

- **메인이 직접** — spec 로드, TDD 사이클(superpowers 위임 포함), 마이그레이션
  작성·적용, 코드 구현, 검증
- **서브 위임** — keeper-api 현재 패턴 훑기 (3단계). `feature-researcher`
  mode: context 재활용

## 절차 (순서대로)

### 1. 입력 확정

- `docs/spec/<feature>.md` 가 입력. 없으면 `/spec` 먼저 돌리라고 안내
- spec 의 상태가 "확정" 인지 확인. "초안" 이면 사용자 컨펌

### 2. spec 의 Data Model + Backend Impact 로드

메인이 직접 spec 읽고 정리:

- Data Model — entity 정의 (컬럼·nullable·UNIQUE·FK·인덱스)
- Backend Impact — 마이그레이션 번호 / DDL 개요 / Controller·Service 변경 /
  DTO 변경
- 테스트 시나리오 — P0 + 엣지 (4단계 TDD 입력)

spec 명세를 **그대로** 코드화. 의사결정 다시 X — 모호하면 spec 으로 돌아가
사용자와 spec 갱신.

### 3. keeper-api 현재 패턴 훑기 — `feature-researcher` 위임 (mode: context)

비슷한 도메인이 어떤 패턴으로 짜여 있는지 파악해야 키퍼 컨벤션 일관성 유지.

```
Agent(subagent_type="feature-researcher",
  description="keeper-api 패턴 조사",
  prompt="mode: context

  새 기능 키워드: <domain>

  훑을 영역 한정:
  - keeper-api/docs/migrations/ (비슷한 도메인 SQL 헤더 / 정책 / 롤백 패턴)
  - keeper-api/docs/<domain>-*.md (정책 문서)
  - keeper-api/src/api/<domain>/ (controller / service / entity / repository / type)
  - keeper-api/src/common/exception/ (BaseException 패턴)
  - keeper-api/src/common/filter/ (ResponseBase / ResponseUtil)

  중점: 이 도메인이 hard delete / 익명화 / 트랜잭션 / FK cascade 같은
  정책을 어떻게 다루는지 한 줄 요약")
```

### 4. TDD 사이클 — superpowers `/test-driven-development` invoke

테스트 자체는 검증된 흐름에 위임. spec 의 테스트 시나리오를 입력으로 던짐.

```
Skill(skill="superpowers:test-driven-development")
```

각 사이클(RED → Verify → GREEN → Verify → REFACTOR) 에서:

- spec 의 P0 시나리오 → service spec 으로 변환 (Given-When-Then → describe/it)
- 엣지 케이스 → 추가 it 블록
- 최소 구현 후 다음 시나리오로

검증 명령: `npx jest <path>` (keeper-api 루트 기준).

### 5. 마이그레이션 SQL 작성 + 로컬 DB 적용

spec 의 예약 번호 사용 (충돌 방지). 헤더 형식은 keeper-api 컨벤션 따라:

- 배경 / 정책 / 사전 확인 / 영향 범위 / 롤백 명시
- 비슷한 도메인 마이그레이션 헤더 그대로 참고 (3단계에서 받은 패턴)

작성 후 로컬 DB 적용:

```bash
mysql -h 127.0.0.1 -P 3306 -u admin -p<pwd> keeper < docs/migrations/NNN-*.sql
```

적용 후 `DESC <table>` 또는 `SHOW CREATE TABLE` 로 검증.

### 6. entity / DTO / controller / service 구현

spec 명세 그대로 코드화. keeper-api 컨벤션 준수:

- **entity** — `@Entity('<table>')`, `@PrimaryGeneratedColumn`, `@Column`
  with length / nullable
- **DTO** — class-validator 데코레이터 (`@IsString` / `@IsOptional` /
  `@MaxLength` 등). spec 의 스키마 3중 검증 결정 따라
- **controller** — `@ApiOperation`, `@ApiOkResponseSchemas`, 적절한 `@Body` /
  `@Param`, `@UseGuards(JwtAuthGuard)` 필요 여부
- **service** — `dataSource.transaction` 패턴 (멀티 쿼리 시), `BaseException`
  매핑, FK cascade / 익명화 정책 spec 따라

코드 추가 후 4단계 TDD 사이클로 돌아가 다음 시나리오.

### 7. 검증

`keeper-api` 루트에서:

```bash
npx tsc --noEmit          # 타입 검증
npx jest                   # 전체 테스트
```

둘 다 통과해야 완료.

실패 시:

- tsc 에러 — spec 의 시그니처와 맞는지 확인
- jest 실패 — 회귀 (다른 spec 깨졌나) 확인 → spec 으로 돌아가 결정 검토
- 임의 워크어라운드 금지 — 사용자 컨펌 받고 진행

## 안티패턴 (왜 안 하는지)

- **spec 없이 구현 시작**: 매번 의사결정 → 일관성 깨짐. spec 이 입력.
- **spec 무시하고 자체 결정**: spec 의 결정을 코드에서 바꾸면 다음 사이클에
  명세 ↔ 코드 어긋남. 모호하면 spec 갱신부터.
- **TDD 사이클 자체 재구현**: superpowers 위임. 이 스킬에서 RED/GREEN 다시
  설명하지 말 것.
- **마이그레이션 번호 임의 결정**: spec 의 예약 번호 사용. 안 하면 머지 시 충돌.
- **로컬 DB 적용 생략**: 적용 검증 안 하면 운영 적용 시 깨짐. `DESC` 로 확인.
- **검증 실패 무시 / 워크어라운드**: 회귀의 신호. 사용자 컨펌 받고 처리.
- **keeper-api 컨벤션 깨기**: BaseException / ResponseBase / FSD 구조 임의
  변경 금지. 비슷한 도메인 패턴 그대로 따라.
