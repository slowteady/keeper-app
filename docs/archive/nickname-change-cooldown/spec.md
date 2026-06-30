# 닉네임 변경 쿨타임 — 기술 명세

> 입력: 닉네임 변경 제한 BP 조사(거래·신뢰 기반 서비스 = 크몽/치지직 30일 쿨타임 패턴) + 현재 닉네임 변경 동선(`users/me` PATCH).
> 범위: 닉네임 변경에 30일 쿨타임 enforcement(백엔드 검증 + 프론트 선제 차단). 이미지 변경·중복 검사는 불변.
> 상태: 확정. 구현 대기.

## 1. Problem / Goals

- keeper 닉네임은 단순 표시명이 아니라 **개인입양 공고 작성자명 · 커뮤니티 글/댓글 작성자명 · 차단/신고 대상 식별자**. 무제한 변경 시 신고·차단 회피, 공고 분쟁 시 작성자 추적 곤란 등 신뢰 훼손.
- 거래·신뢰 기반 서비스 BP(크몽 "변경 후 30일", 치지직 "30일 쿨타임")에 맞춰 **30일 쿨타임** 도입.
- Goals: ① 닉네임이 실제로 바뀌는 경우에만 쿨타임 적용 ② 백엔드 검증으로 클라 우회 차단(block) ③ 프론트는 화면 진입 시점에 남은 일수 계산해 버튼 선제 차단 + 안내.
- Non-Goals: 이미지 변경 제한 / "진행 거래 중 제한"(keeper엔 거래 상태 개념 약함 — 단순 쿨타임으로 충분) / 변경 이력 로그 테이블(현 단계 불필요).

## 2. Data Model (확정)

### entity: User (`user`) — 컬럼 1개 추가

| 컬럼              | 타입           | nullable | UNIQUE | 기본값 | FK  | 인덱스 | 비고                                                         |
| ----------------- | -------------- | -------- | ------ | ------ | --- | ------ | ------------------------------------------------------------ |
| nicknameUpdatedAt | TIMESTAMPTZ(6) | YES      | -      | (없음) | -   | -      | 마지막 닉네임 변경 시각. NULL=변경 이력 없음(=쿨타임 미적용) |

정책:

- **NULL = 무제한.** 가입 시 자동 부여 닉네임(`nickname-generator`)은 사용자 의도가 아니므로 **첫 수동 변경은 자유**. 그 변경 시점에 `now()` 기록되며 이후 30일 쿨타임 시작.
- 마이그레이션은 **nullable로만 추가** — 백필 없음, 인덱스 없음, 테이블 rewrite 없음(`NOT NULL DEFAULT now()`는 volatile 평가로 rewrite 유발 → 금지).

## 3. Backend Impact (keeper-backend, develop · prod 자동배포 라인)

> 주의: develop push 시 `prisma migrate deploy` 자동 실행 → **로컬 커밋·로컬 DB 적용까지만**, push 금지.

### 3-1. 마이그레이션 `add_user_nickname_updated_at`

```sql
ALTER TABLE "user" ADD COLUMN "nicknameUpdatedAt" TIMESTAMPTZ(6);
```

- `schema.prisma` User 모델에 `nicknameUpdatedAt DateTime? @db.Timestamptz(6)` 추가.

### 3-2. error-code / exception

- `error-code.ts`에 추가: `NICKNAME_CHANGE_LIMITED { status: 429, code: 'NICKNAME_CHANGE_LIMITED', message: '아직 닉네임을 변경할 수 없어요.' }`
- `user.exception.ts`에 `NicknameChangeLimitedException()` 추가.

### 3-3. Service / Select 변경

| 파일              | 메서드      | 변경                                                         |
| ----------------- | ----------- | ------------------------------------------------------------ |
| `user.service.ts` | `ME_SELECT` | `nicknameUpdatedAt: true` 추가 → `me`/`updateMe` 응답에 포함 |
| `user.service.ts` | `updateMe`  | 닉네임이 **현재값과 다를 때만** 쿨타임 검증·기록             |

`updateMe` 로직(닉네임 분기):

1. `dto.nickname`이 있고 현재 `user.nickname`과 다르면:
   - 현재 `nicknameUpdatedAt` 조회. `!= null && now - nicknameUpdatedAt < 30일` → `NicknameChangeLimitedException`.
   - 통과 시 `data.nickname = dto.nickname`, `data.nicknameUpdatedAt = new Date()`.
2. `dto.nickname`이 현재값과 동일 → 닉네임 변경 아님(쿨타임·기록 스킵).
3. 이미지 변경은 쿨타임 무관(기존 그대로).
4. 중복(P2002) 처리는 기존 유지.

> 쿨타임 상수 `NICKNAME_COOLDOWN_DAYS = 30` (service 상수). `DAY_MS` 재사용.

## 4. 프론트 API 흐름 (keeper-app)

- 변경 없음: `updateMe`(PATCH `/users/me`) / `authQueries.me()`(GET `/users/me`) 그대로.
- `me` 응답에 `nicknameUpdatedAt` 추가 → `useCurrentUser`의 `user`에 노출.
- 닉네임 화면(`app/(untabs)/(auth)/nickname/index.tsx`)에서 `user.nicknameUpdatedAt`로 쿨타임 계산:
  - 남은 일수 > 0 → `NicknameForm extraDisabled` + 안내 children("다음 변경은 N일 후 가능해요").
  - mutation `onError` 429(`NICKNAME_CHANGE_LIMITED`) → 토스트(안전망, race 대비).
- 쿨타임 계산 유틸: `shared/lib` 순수 함수 `getNicknameCooldownDays(nicknameUpdatedAt?: string | null): number`(남은 일수, 0 = 변경 가능).

## 5. 스키마 3중 검증

| 필드              | frontend zod (`entities/auth/schema.ts UserSchema`) | backend 응답 (`ME_SELECT`)              | DB column                               | 일치 |
| ----------------- | --------------------------------------------------- | --------------------------------------- | --------------------------------------- | ---- |
| nicknameUpdatedAt | `z.string().nullable().optional()` (ISO 문자열)     | `nicknameUpdatedAt: true` (Date→직렬화) | `nicknameUpdatedAt TIMESTAMPTZ(6) NULL` | ✅   |

- `updateMeSchema`(요청 DTO)는 변경 없음 — 클라가 `nicknameUpdatedAt`를 보내지 않음(서버가 기록).

## 6. 테스트 시나리오

### 백엔드 (`user.service.spec.ts`)

- P0-1: `nicknameUpdatedAt = null` + 닉네임 변경 → 성공, `nicknameUpdatedAt` 기록됨.
- P0-2: `nicknameUpdatedAt = 29일 전` + 닉네임 변경 → `NicknameChangeLimitedException`(429).
- P0-3: `nicknameUpdatedAt = 31일 전` + 닉네임 변경 → 성공, 시각 갱신.
- 엣지-1: 닉네임이 현재값과 동일 → 쿨타임 무시(성공, 기록 미변경).
- 엣지-2: 이미지만 변경(닉네임 미포함) → 쿨타임 무시.
- 엣지-3: 닉네임 중복(P2002) → `NicknameDuplicateException`(쿨타임 검사 이후/이전 무관, 기존 동작 유지).

### 프론트

- `getNicknameCooldownDays`: null→0, 31일전→0, 29일전→1(올림), 오늘→30.
- 닉네임 화면: 쿨타임 중 버튼 disabled + 안내 노출 / 쿨타임 종료 시 정상 변경.

## 7. ADR

- **쿨타임 30일**: SNS형 느슨 제한(IG/Discord 시간 단위)이 아니라 거래·신뢰형(크몽/치지직 30일) 채택 — keeper 개인입양=신뢰 거래, 닉네임=식별자.
- **NULL=무제한, 첫 변경 자유**: 가입 자동 닉네임을 강제 쿨타임에 묶으면 첫 정정조차 막혀 UX 악화. 첫 수동 변경부터 카운트.
- **남은 일수는 프론트 계산(me의 nicknameUpdatedAt)**: 백엔드 동적 메시지(고정 `ErrorCodeValue.message` 구조와 충돌) 대신 프론트가 선제 안내. 백엔드 429는 race·우회 안전망.
- **HTTP 429**: 409는 닉네임 중복에 사용 중 → 의미 충돌 회피. "정책상 빈도 제한" = 429 Too Many Requests.
- **이력 로그 미도입**: 현 단계 쿨타임엔 `nicknameUpdatedAt` 단일 컬럼으로 충분. 변경 이력 분석 필요 시 후속.
