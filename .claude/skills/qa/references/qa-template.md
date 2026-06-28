# QA 산출물 템플릿

`docs/qa/<feature>.md` 작성 시 아래 골조를 그대로 복사해서 채운다.

P0 미해결 있으면 상태 "실패" / 해결 후 재검증 시 "통과".
같은 기능 재검증 시 날짜·상태만 추가, 이전 결과는 보존.

---

```markdown
# QA: <기능명>

## 1. 메타

- QA 일자: YYYY-MM-DD
- 대상 기능: <feature-name>
- 상태: 진행 / 통과 / 실패 (P0 잔존)
- 입력 PRD: docs/prd/<feature>.md
- 입력 Design: docs/design/<feature>.md
- 입력 Spec: docs/spec/<feature>.md

## 2. 명세 정합성

| 명세 항목              | 위치 (file:line) | 상태              |
| ---------------------- | ---------------- | ----------------- |
| <PRD FR-1>             | src/...          | ✅                |
| <design 컴포넌트 매핑> | ...              | ⚠️ <한 줄 어긋남> |
| <spec Data Model>      | ...              | ✅                |
| <spec API 흐름>        | ...              | ❌ <누락>         |

## 3. 위험 기반 분석

### 최근 변경 모듈

| 변경 모듈       | 영향 범위             | 커버리지 갭        |
| --------------- | --------------------- | ------------------ |
| <file/슬라이스> | <영향 받는 다른 모듈> | <테스트 없는 부분> |

### 회귀 위험 영역

- <어느 기존 기능이 영향 받을 가능성>
- ...

## 4. 자동 테스트 결과

- **tsc** (keeper-app): PASS / FAIL (에러 N건)
- **jest** (keeper-app): X/Y PASS — 실패 케이스: <목록>
- **eslint** (keeper-app): PASS / FAIL (경고 N건)
- **tsc** (keeper-api, 있는 경우): ...
- **jest** (keeper-api, 있는 경우): ...

## 5. MCP 시뮬 검수

### iOS

- 핵심 흐름: ✅ / ⚠️ <한 줄>
- 시각 회귀: <발견 / 없음>
- 인터랙션: <발견 / 없음>
- 빈/에러 상태: <발견 / 없음>

### Android (변경 영역에 영향 있으면)

- ...

## 6. 발견 사항

### P0 (즉시 fix)

- <항목>: <사유> — 위치 <file:line>

### P1 (다음 사이클)

- <항목>: <사유>

### P2 (관찰)

- <항목>: <사유>

## 7. 권장 조치

- **즉시** — P0 항목별 처리 방향
- **다음 사이클** — P1 항목 우선순위
- **관찰** — P2 항목 추적 방법

## 참고

- PRD: `docs/prd/<feature>.md`
- Design: `docs/design/<feature>.md`
- Spec: `docs/spec/<feature>.md`
- 관련 commit 범위: <git range>
```
