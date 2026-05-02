# 백엔드 수정 사항

## 인증 (Auth)

### 1. 신규 유저 동시 가입 시 nickname UNIQUE 위반

**시나리오**:

```
12:00:00 — 유저 A가 카카오로 최초 로그인
         → toUserEntity()에서 nickname 미할당
         → TypeORM save()가 undefined 프로퍼티를 쿼리에서 제외
         → MySQL이 VARCHAR NOT NULL implicit default 적용 → nickname '' 저장

12:00:01 — 유저 A가 회원가입 페이지에서 닉네임 입력 중 (아직 제출 안 함)

12:00:02 — 유저 B가 구글로 최초 로그인
         → 동일하게 nickname '' 저장 시도
         → UNIQUE 제약 위반 → DB 에러
```

**원인**: nickname이 `NOT NULL UNIQUE`인데 회원가입 전 유저는 모두 빈 문자열 `''`로 저장됨

**AS-IS**:

```sql
`nickname` VARCHAR(255) NOT NULL UNIQUE
```

- 회원가입 전: `''` (빈 문자열) → 두 명 이상 동시 가입 시 UNIQUE 충돌
- 회원가입 후: 실제 닉네임

**TO-BE**:

```sql
`nickname` VARCHAR(255) NULL UNIQUE
```

- 회원가입 전: `NULL` (UNIQUE 검사에서 제외 — NULL은 여러 개 가능)
- 회원가입 후: 실제 닉네임 (UNIQUE 적용)
- `isNew` 판단: `!user.nickname` — 기존 로직 그대로 동작 (NULL은 falsy)

**수정 대상**:

- `database-schema.sql` — nickname 컬럼 `NOT NULL` → `NULL` 변경
- `src/api/auth/entity/user.entity.ts` — `@Column()` → `@Column({ nullable: true })`

**수정 필요 이유**:

- 현재 스키마(`database-schema.sql:13,23`)는 `NOT NULL UNIQUE`인데 최초 소셜 로그인 시 nickname을 입력받지 않음 → `AuthConverter.toUserEntity`(`auth.converter.ts:10-18`)가 nickname을 세팅하지 않아 MySQL implicit default로 빈 문자열 `''`이 저장됨
- 빈 문자열은 UNIQUE 제약에서 중복으로 취급됨 (MySQL은 `''`도 고유 값으로 간주) → 서로 다른 두 소셜 유저가 회원가입 완료 전에 동시에 최초 로그인하면 `Duplicate entry '' for key 'uk_user_nickname'`로 DB 오류 발생 → 500 에러로 유저 가입 자체 실패
- `NULL`로 변경하면 MySQL UNIQUE 제약이 NULL을 중복으로 취급하지 않음 → 회원가입 전 유저 다수 공존 가능, 회원가입 완료 후 실제 닉네임 할당 시점부터 UNIQUE 적용
- `isNew` 판단 로직(`auth.converter.ts:34` `!user.nickname`)은 NULL도 falsy이므로 기존 동작 그대로 유지됨 → 추가 로직 변경 불필요

---

## 보호소 (Shelter)

### 2. 보호소 목록 API distance 정렬 누락

**엔드포인트**: `GET /api/v2/shelters`

**현상**: `findAll` 쿼리에 `ORDER BY distance` 없이 DB 삽입 순서로 반환. 반면 검색 엔드포인트(`GET /api/v2/shelters/search`)의 `findByQuery`에는 `.orderBy('distance', 'ASC')`가 있음.

**수정 필요 이유**:

- 지도 화면 하단 리스트는 "가까운 보호소 순"으로 노출되어야 함 (기획 요구사항)
- 프론트(`useHomeShelter`, `useShelterMap`)는 서버 응답 순서를 그대로 사용하며 별도 정렬을 하지 않음 → 서버 정렬에 전적으로 의존
- `distance`는 이미 쿼리에서 `addSelect`로 계산 중이라 `ORDER BY distance ASC` 한 줄 추가만으로 해결 가능
- 같은 도메인의 `findByQuery`는 이미 동일 방식으로 정렬하고 있어 엔드포인트 간 동작 일관성 확보 필요
- 페이지네이션 도입 시 서버 정렬이 전제되어야 페이지 간 순서가 어긋나지 않음

**AS-IS**:

```typescript
// shelter_v2.repository.ts — findAll()
.setParameters({ latitude, longitude, distance, userLatitude, userLongitude })
.getRawMany(); // ORDER BY 없음
```

**TO-BE**:

```typescript
.setParameters({ latitude, longitude, distance, userLatitude, userLongitude })
.orderBy('distance')
.getRawMany();
```

**수정 대상**:

- `src/api/shelter/repository/shelter_v2.repository.ts` — `findAll` 메서드에 `.orderBy('distance')` 추가 (ORDER BY 기본이 ASC)

---

### 3. `GET /auth/me` 응답에 socialType 필드 추가

**이유**: 로그아웃/회원탈퇴 시 소셜 SDK 세션 종료(카카오 logout, 네이버 logout, 구글 signOut)를 호출해야 하는데, 현재 유저 정보에 socialType이 없어서 어떤 SDK를 호출해야 하는지 알 수 없음.

**AS-IS**:

```json
// GET /auth/me 응답
{ "id": 1, "name": "...", "nickname": "...", "email": "...", "image": "..." }
```

**TO-BE**:

```json
{ "id": 1, "name": "...", "nickname": "...", "email": "...", "image": "...", "socialType": "KAKAO" }
```

**수정 대상**:

- `GET /auth/me` 응답 DTO에 `socialType` 필드 추가
- 프론트 `UserDto` 스키마에 `socialType` 추가 후 로그아웃/탈퇴 시 소셜 세션 종료 로직 구현

**수정 필요 이유**:

- 기획 요구사항: 로그아웃/회원탈퇴 시 해당 소셜 SDK 세션도 함께 종료해야 함 (예: 카카오 로그아웃, 네이버 unlink, 구글 signOut, 애플 revoke). 안 하면 다음 로그인 시도 시 기존 소셜 토큰으로 자동 로그인되어 "다른 계정으로 로그인" 시나리오가 불가능
- 현재 프론트 `useLogout`(`use-logout.ts`)은 서버 로그아웃 + 로컬 토큰 제거만 수행, 소셜 SDK 세션 종료 로직이 아예 없음 → 어떤 SDK를 호출해야 할지 알 수 없기 때문에 구현을 못 하고 있는 상태
- `UserEntity`에 `socialType` 컬럼은 이미 존재(`user.entity.ts:28`)하고 가입 시점에 세팅됨(`auth.converter.ts:13`). 단지 `AuthConverter.toAuthResponse`(`auth.converter.ts:59-67`)가 응답 DTO에 포함시키지 않을 뿐
- 서버 수정 범위 작음: converter에 한 줄(`response.socialType = user.socialType`) + DTO 타입에 필드 추가
- 이 필드 없이는 프론트에서 "로그아웃 시 소셜 세션 미해제" 이슈를 해결할 방법이 없음 (유저에게 소셜 타입을 매번 재입력받는 것은 UX적으로 불가)

---

## 커뮤니티 (Community)

> 커뮤니티 기능 검토 후 추가 예정
