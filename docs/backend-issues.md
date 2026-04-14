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

---

## 보호소 (Shelter)

### 2. 보호소 목록 API distance 정렬 누락

**엔드포인트**: `GET /api/v2/shelters`

**현상**: `findAll` 쿼리에 `ORDER BY distance` 없이 DB 삽입 순서로 반환. 반면 검색 엔드포인트(`GET /api/v2/shelters/search`)의 `findByQuery`에는 `.orderBy('distance', 'ASC')`가 있음.

**AS-IS**:

```typescript
// shelter_v2.repository.ts — findAll()
.setParameters({ latitude, longitude, distance, userLatitude, userLongitude })
.getRawMany(); // ORDER BY 없음
```

**TO-BE**:

```typescript
.setParameters({ latitude, longitude, distance, userLatitude, userLongitude })
.orderBy('distance', 'ASC')
.getRawMany();
```

**수정 대상**:

- `src/api/shelter/repository/shelter_v2.repository.ts` — `findAll` 메서드에 `.orderBy('distance', 'ASC')` 추가

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

---

## 커뮤니티 (Community)

> 커뮤니티 기능 검토 후 추가 예정
