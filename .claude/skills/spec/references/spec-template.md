# Spec 산출물 템플릿

`docs/spec/<feature>.md` 작성 시 아래 골조를 그대로 복사해서 채운다.

Data Model / 스키마 3중 검증 / 테스트 시나리오는 **TBD 없이 확정** 한다.
다음(`/implement`) 단계가 명세 그대로 코드화하므로.

---

````markdown
# Spec: <기능명>

## 1. 메타

- 작성일: YYYY-MM-DD
- 상태: 초안 / 리뷰 / 확정
- 입력 PRD: docs/prd/<feature>.md
- 입력 Design: docs/design/<feature>.md

## 2. Data Model (확정)

### entity: <name>

| 컬럼 | 타입   | nullable | UNIQUE | 기본값         | FK  | 인덱스 | 비고 |
| ---- | ------ | -------- | ------ | -------------- | --- | ------ | ---- |
| id   | BIGINT | NO       | PK     | AUTO_INCREMENT | -   | -      |      |
| ...  | ...    | ...      | ...    | ...            | ... | ...    | ...  |

관계:

- <FK column> → <table.column> `ON DELETE CASCADE / SET NULL / RESTRICT`

PII / 익명화 영향:

- <컬럼> — hard delete 시 NULL 익명화 / 보존 / 삭제 정책

## 3. Backend Impact

### 마이그레이션

- 번호 예약: **NNN** (keeper-api 현재 마지막 + 1)
- 파일: `keeper-api/docs/migrations/NNN-<feature>.sql`
- DDL 개요:

```sql
-- 한 줄 요약
CREATE TABLE ... / ALTER TABLE ...
```
````

### Controller / Service 변경

| 파일                                                       | 메서드   | 변경 내용                         |
| ---------------------------------------------------------- | -------- | --------------------------------- |
| `keeper-api/src/api/<domain>/controller/<x>.controller.ts` | <method> | <Body 추가 / 시그니처 변경 / etc> |
| `keeper-api/src/api/<domain>/service/<x>.service.ts`       | <method> | <트랜잭션 / 로직 변경>            |

### DTO 변경

| DTO           | 변경                                    |
| ------------- | --------------------------------------- |
| `<X>Request`  | + reasonDetail?: string (MaxLength 500) |
| `<X>Response` | - 없음 / + ...                          |

### 정책 영향

- hard delete / 익명화 / 모더레이션 / FK cascade 같은 도메인 정책 영향 여부

## 4. 프론트 API 호출 흐름

### Query / Mutation 위치

| API            | 정의 위치                                | queryKey / mutationFn       |
| -------------- | ---------------------------------------- | --------------------------- |
| useXxxQuery    | `src/entities/<domain>/api.ts`           | `xxxQueries.detail(id)`     |
| useXxxMutation | `src/features/<domain>/model/use-xxx.ts` | `mutationFn: xxxApi.create` |

### 캐시 정책

- 성공 후 invalidate: `xxxQueries.all()` / `xxxQueries.list()`
- optimistic update 여부: yes / no
- staleTime: <기본 / 커스텀>

### 에러 처리

- interceptor 영향 (401/403/5xx)
- 도메인 예외 → `BaseException` 매핑 (`<NAME>_EXCEPTION_CODE`)
- 사용자 노출 메시지 (토스트 등)

## 5. 스키마 3중 검증

| 필드   | frontend zod (`entities/<x>/schema.ts`) | backend DTO (`api/<x>/type/`)               | DB column (entity)  | 일치             |
| ------ | --------------------------------------- | ------------------------------------------- | ------------------- | ---------------- |
| <name> | `z.string().max(500).optional()`        | `@IsString() @IsOptional() @MaxLength(500)` | `VARCHAR(500) NULL` | ✅               |
| <name> | ...                                     | ...                                         | ...                 | ⚠️ <어떤 불일치> |

### 불일치 / 추가 작업

- <필드>: zod 는 optional 인데 DTO 는 required → DTO 수정 또는 zod 강제
- ...

## 6. 테스트 시나리오 (다음 /implement TDD 입력)

### P0 시나리오 (Given-When-Then)

- **TS-1**: Given <상황>, When <행동>, Then <기대>
- **TS-2**: ...

### 엣지 케이스

- 동시성 — <시나리오>
- Validation 실패 — <필드 X 누락 시>
- FK 위반 — <부모 미존재 시>
- 인증 만료 — <401 응답 시>
- 빈 응답 / 네트워크 에러 — <UI 상태>

## 7. ADR + Open Issues

### 결정 기록

| 결정                 | 옵션               | 채택     | 사유                                        |
| -------------------- | ------------------ | -------- | ------------------------------------------- |
| <필드> nullable 여부 | NULL / NOT NULL    | NULL     | 회원가입 전 빈 상태 허용 (UNIQUE 충돌 회피) |
| <FK> 정책            | CASCADE / SET NULL | SET NULL | 컨텐츠 보존 + 작성자 익명화                 |

### Open Issues

- TBD — <무엇을 결정해야 하는지>

## 참고

- PRD: `docs/prd/<feature>.md`
- Design: `docs/design/<feature>.md`
- 백로그: `docs/backlog/<feature>.md`
- 관련 keeper-api docs: <링크>
- 비슷한 도메인 마이그레이션: `keeper-api/docs/migrations/NNN-*.sql`

```

```
