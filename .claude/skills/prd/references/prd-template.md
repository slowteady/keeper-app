# PRD 산출물 템플릿

`docs/prd/<feature>.md` 작성 시 아래 골조를 그대로 복사해서 채운다.
keeper 1인 운영 + AI 협업 맥락에 맞게 lean 10 섹션으로 정리됨.

비어두지 말 것. 정보가 없으면 `TBD — <어떤 의사결정 대기 중인지>` 로 명시.

---

```markdown
# PRD: <기능명>

## 1. 메타

- 작성일: YYYY-MM-DD
- 상태: 초안 / 리뷰 / 확정 / 보류 / 컷
- 입력 백로그: docs/backlog/<feature-name>.md
- 관련 PRD: <있다면 링크>

## 2. Problem / Why

- 어떤 사용자 문제를 해결하는가
- 해결되지 않으면 어떤 비용·기회손실
- 사용자 시그널·근거 (관찰 / 인터뷰 / 데이터)

**Problem before solution.** 이 섹션이 약하면 6(Functional Requirements) 로
넘어가지 않는다.

## 3. Goals / Non-Goals

### Goals

- <달성하려는 outcome 1>
- <outcome 2>

### Non-Goals

- <이번에 의도적으로 안 함 1> — <왜>
- <안 함 2> — <왜>

Non-Goals 비우지 말 것. 스코프 컷팅은 1인 운영의 생명선.

## 4. Success Metrics

- 출시 후 가치 검증 시그널 (가벼운 것 포함)
- 정량: <측정 가능한 숫자>
- 정성: <관찰할 사용자 행동 변화>

## 5. User Scenarios

### 페르소나

- <페르소나 1: 누구, 어떤 상태>
- <페르소나 2 — 필요 시>

### 시나리오 (Given-When-Then)

- Given <상황>, When <행동>, Then <기대 결과>
- ...

## 6. Functional Requirements

우선순위로 분류. **P0 = 출시 필수, P1 = 다음, P2 = 나중**.

### P0 (MVP)

- FR-1. <사용자 스토리: As a ..., I want ..., so that ...>
  - 수용 기준: <Acceptance Criteria 1>
  - 수용 기준: <AC 2>
- FR-2. ...

### P1 (다음)

- ...

### P2 (나중)

- ...

UX 화면은 Figma 외부 링크로 참조: <Figma URL>

## 7. Data Model (확정)

백로그의 "초안" 을 확정 상태로. 컬럼 정의에 **nullable / UNIQUE / 길이 / 기본값**
명시.
```

<entity_name>

- id: BIGINT PK AI
- <col>: <type> NOT NULL / NULL / UNIQUE
- ...

```

관계: <FK / cascade 정책>

DB·DTO 영향 없는 프론트 전용 기능이면 "프론트 전용" 명시.

## 8. Backend Impact

### 마이그레이션

- 번호 예약: NNN (현재 마지막 + 1)
- 파일: `keeper-api/docs/migrations/NNN-<feature>.sql`
- 변경 요약: <DDL 변경 한 줄>

### API / DTO

- 엔드포인트: <METHOD /path>
- 변경 controller/service: <file 경로>
- DTO 변경: <Request/Response 클래스>

### 영향 범위

- 마스킹 / hard delete / 모더레이션 등 도메인 정책 영향 여부

PRD 단계에서 코드 수정 금지. 영향 범위만 명시.

## 9. Rollout Plan (Phase)

### Phase 0: 선행
- <선행 조건 해결>

### Phase 1: MVP
- <P0 요구사항 출시>

### Phase 2: 확장
- <P1 요구사항 출시>

각 Phase 의 "출시 신호" (어떤 시그널이 보이면 다음 Phase) 명시.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정 | 옵션 | 채택 | 사유 |
|---|---|---|---|
| <결정 이름> | A vs B | A | <왜 A 가 keeper 에 맞는지> |

컷한 옵션은 사유까지 — 미래에 다시 끄집어내지 않게.

### Open Issues

- TBD — <무엇을 결정해야 하는지>
- ...

## 참고

- 백로그 원본: `docs/backlog/<feature>.md`
- 레퍼런스 BP: <외부 링크>
- 관련 keeper-api docs: <링크>
```
