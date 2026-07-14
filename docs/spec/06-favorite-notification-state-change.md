# spec — 관심 공고 상태 변화 알림 (#3, ADOPT_CLOSED)

> 상태: 확정 (2026-07-14)
> 입력 설계: `docs/superpowers/specs/2026-07-10-favorite-notifications-design.md` "#3 관심 공고 상태 변화"
> 선행: #1 `ADOPT_DEADLINE_NEAR`(출시), #2 `SHELTER_NEW_ADOPT`(출시). 본 문서는 favorite-notifications 세트의 마지막.

## 1. 배경 / 목표

관심(`AbandonmentFavorite`) 등록한 공고가 **보호중 → 종료**로 바뀌면 사용자에게 1회 알린다. 관심 표시의 클로저를 제공하고 재방문을 유도한다. 종료 원인(입양·반환·자연사·안락사·기증·방사)은 **구분하지 않고 "공고 종료" 하나로** 표현한다 — 죽음 소식을 푸시로 전달하는 정서적 리스크를 제거하고 diff 조건을 단일화하기 위함(ADR-1).

## 2. 트리거 정의

`Abandonment.processState`는 공공 API 원문(한글)을 그대로 저장하고, `PROCESS_STATE_TO_STATUS`(abandonment.converter.ts)로 정규화한다:

| 원본(DB)     | status        | 종료여부      |
| ------------ | ------------- | ------------- |
| 보호중       | PROTECTING    | — (시작 상태) |
| 종료(입양)   | ADOPTED       | ✅            |
| 종료(반환)   | RETURNED      | ✅            |
| 종료(기증)   | DONATED       | ✅            |
| 종료(방사)   | RELEASED      | ✅            |
| 종료(자연사) | NATURAL_DEATH | ✅            |
| 종료(안락사) | EUTHANIZED    | ✅            |

- **트리거**: `이전 status === PROTECTING` **그리고** `신규 status !== PROTECTING`(= 임의 종료). 원인 종류는 불문.
- **비트리거**: PROTECTING→PROTECTING, 종료→종료, 최초 삽입이 종료 상태(이전값 없음), status null.

## 3. 데이터 모델

마이그레이션 **신규 1건** (폴더명 `20260710065000_backfill_abandonment_created_at_out_of_window` 다음, 생성 시각 기준). enum 값 추가만 — 테이블/컬럼 변경 없음.

```prisma
enum NotificationType {
  // ... 기존
  ADOPT_DEADLINE_NEAR
  SHELTER_NEW_ADOPT
  ADOPT_CLOSED        // 신규
}
```

신규 컬럼 없음. 인덱스 없음. `AbandonmentFavorite`·`Notification` 스키마 그대로 사용.

## 4. Backend Impact (keeper-backend)

변경 대상:

| 파일                                                     | 변경                                                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `prisma/schema.prisma`                                   | `NotificationType`에 `ADOPT_CLOSED` 추가                                                                                |
| `prisma/migrations/<ts>_add_adopt_closed_notification/`  | enum 값 추가 마이그레이션                                                                                               |
| `src/batch/abandonment-sync/abandonment-sync.service.ts` | `filterChanged`의 `select`에 `processState` 추가 → 이전 status 확보. upsert 후 전환분 수집 → 알림 생성(게이트 내부)     |
| `src/modules/notification/notification.dto.ts`           | `NOTIFICATION_TYPES` 상수에 `ADOPT_CLOSED` 추가(+ 누락된 `ADOPT_DEADLINE_NEAR`·`SHELTER_NEW_ADOPT` 정합 — 용도 확인 후) |
| `src/batch/abandonment-sync/*.spec.ts`                   | 전환 감지·게이트·중복방지·묶음 테스트                                                                                   |

### 4.1 diff 감지 흐름 (abandonment-sync)

1. `filterChanged`는 이미 `existing`(desertionNo, updTm)을 조회 → **`processState` 추가 select**해 `desertionNo → 이전 processState` 맵 구성.
2. 기존 chunk upsert 로직 유지(데이터 sync는 게이트 무관, 항상 실행).
3. upsert 성공분 중 `이전=보호중 & 신규=종료`인 desertionNo 수집.
4. **게이트**: `const { notificationBatchEnabled } = await appConfig.get()`. false면 알림 스텝 skip(데이터는 이미 반영됨).
5. 수집된 desertionNo → `AbandonmentFavorite`(userId) 조회 → 사용자별 묶음 → `notification.create`.
6. **중복 방지**: `(userId, type=ADOPT_CLOSED, refId=desertionNo)` 존재 검사 후 생성(부분실패·재실행 안전).

### 4.2 묶음 규칙 (#1과 동일)

사용자당 같은 sync 실행에서 종료된 관심 공고를 묶는다.

- 1건 → `refType='adopt'`, `refId=desertionNo`, 딥링크=공고 상세.
- N건 → `refType='favorite'`, `refId=null`, 요약. 딥링크=관심 목록.

### 4.3 알림 문구

| 케이스 | title                          | body                                   |
| ------ | ------------------------------ | -------------------------------------- |
| 1건    | 관심 공고가 종료되었어요       | 관심 표시한 공고의 모집이 종료됐어요   |
| N건    | 관심 공고 {N}건이 종료되었어요 | 관심 표시한 공고들의 모집이 종료됐어요 |

원인(입양/반환/폐사 등) 미표기. 카테고리 `FAVORITE`.

## 5. 프론트 API 흐름 (keeper-app)

알림 목록은 기존 `notification` 슬라이스가 그대로 렌더. 신규는 **타입 인지**만 추가:

| 파일                                  | 변경                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/entities/notification/schema.ts` | `NOTIFICATION_TYPES`에 `ADOPT_CLOSED` 추가, `NOTIFICATION_TYPE_LABEL`에 `ADOPT_CLOSED: '공고 종료'` 추가 |

- 딥링크: `refType='adopt'` → 공고 상세(`/(untabs)/adopt/[id]`, refId=desertionNo), `refType='favorite'` → 관심 목록. 기존 라우팅 재사용, 신규 없음.
- 신규 queryKey/mutation 없음(목록·unread-count 기존).
- **주의**: `NotificationListResponseSchema`가 모르는 타입을 드롭(`.nullable().catch(null)`)하므로, 앱 zod에 `ADOPT_CLOSED` 미추가 시 알림이 조용히 사라진다 → 반드시 추가.

## 6. 스키마 3중 검증

| 필드                  | 앱 zod (`entities/notification/schema.ts`) | backend (`notification.dto.ts` / prisma) | DB (prisma enum) | 일치                 |
| --------------------- | ------------------------------------------ | ---------------------------------------- | ---------------- | -------------------- |
| `ADOPT_CLOSED`        | 추가 필요                                  | 상수 추가 필요                           | enum 추가 필요   | 3곳 모두 추가로 정합 |
| `ADOPT_DEADLINE_NEAR` | 有                                         | **상수 누락**                            | enum 有          | backend 상수 보정    |
| `SHELTER_NEW_ADOPT`   | 有                                         | **상수 누락**                            | enum 有          | backend 상수 보정    |

→ 추가 작업: backend `NOTIFICATION_TYPES` 상수의 용도 확인(preference 매핑 등) 후 배치 3종 정합. 앱/DB는 `ADOPT_CLOSED`만 추가.

## 7. 테스트 시나리오

### P0 (Given-When-Then)

1. **전환 발생·알림 생성**: Given 관심 등록 유저 + 이전 보호중 공고, When sync가 종료(입양) 상태를 upsert, Then `ADOPT_CLOSED` 알림 1건(refId=desertionNo) 생성.
2. **게이트 OFF**: Given `notificationBatchEnabled=false` + 동일 전환, When sync, Then 데이터는 종료로 갱신되지만 알림 0건.
3. **원인 불문**: Given 반환/자연사/안락사/기증/방사 각 전환, When sync, Then 모두 동일 `ADOPT_CLOSED` 알림(문구 동일).

### 엣지

4. 관심 등록 유저 없음 → 알림 0건.
5. 보호중→보호중(변화 없음) → 알림 0건.
6. 종료→종료(이미 종료) → 알림 0건.
7. 최초 삽입이 종료 상태(이전값 없음) → 알림 0건(전환 아님).
8. 이전 status null → 알림 0건.
9. 중복 방지: 같은 전환에 대해 sync 재실행 → 알림 중복 생성 안 됨.
10. 한 유저의 관심 공고 여러 건 동시 종료 → 요약 1건으로 묶음(refType='favorite').
11. 유저 탈퇴(User 삭제) → FK cascade로 favorite 제거 → 없는 유저에게 발송 시도 안 함.
12. upsert chunk 부분 실패 → 성공분에 대해서만 알림.
13. 게이트 ON이지만 upsert 실패 → 알림 생성 안 됨(성공 전제).

## 8. ADR

- **ADR-1 원인 미구분 단일 알림**: 안락사·자연사를 좋은 소식(입양)과 같은 채널로 원인까지 푸시하면 사용자에게 상처. 모든 종료를 "공고 종료"로 묶어 정서적 리스크 제거 + diff 조건 단일화. 앱 내 상세 화면의 status 표시는 진실 그대로 유지(푸시 채널에서만 원인 비노출).
- **ADR-2 게이트를 sync 하위 스텝에**: #1·#2는 순수 알림 크론이라 진입점 게이트였으나, #3은 데이터 sync에 얹힌다. sync는 항상 실행돼야 하므로 알림 생성 스텝만 게이트로 감싼다.
- **ADR-3 새 컬럼 없이 enum만**: 전환 상태 이력 테이블을 두지 않는다. 공공 API가 종료 후 상태를 유지하므로 diff는 이전 DB값 1회 비교로 충분. 알림 자체가 이력(중복 방지 키로 활용).
- **ADR-4 `ADOPT_CLOSED` 명명**: #1 `ADOPT_DEADLINE_NEAR`와 결 맞춤(대상=관심 입양공고).
