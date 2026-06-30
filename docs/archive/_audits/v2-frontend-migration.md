# keeper-app as-is → to-be 전환 명세 (v2 백엔드 정합)

- **일자**: 2026-06-02
- **as-is**: 구 keeper-api 계약을 보던 keeper-app
- **to-be**: keeper-backend v2 (NestJS 11 + Prisma 7 + PostgreSQL) 계약
- **브랜치**: keeper-app `feature/community`, keeper-backend `develop`

> 범례 — **유지**: 경로·구조 변경 없이 그대로 동작 / **변경**: as-is와 달라져 수정

---

## 0. 전환 한눈에

| 도메인                   | 유지                                        | 변경                                                                     |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------ |
| 전역(baseURL)            | —                                           | `/api` prefix 제거, 포트 8080→3000                                       |
| adopt                    | 찜 토글, id(string)                         | 목록·상세·찜목록 경로, envelope, page base                               |
| shelter                  | 찜 토글, 찜목록 envelope, id(string)        | 목록·검색·상세·카운트·찜목록 경로, 보호소공고 envelope·page              |
| auth/user                | login·agree·refresh·logout 경로             | me/탈퇴/수정 경로, 닉네임중복(메서드+경로), 회원가입(제거), id, nickname |
| community                | 게시글 CRUD·좋아요·신고 경로, 목록 envelope | 내글/도움댓글/차단 경로, id                                              |
| comment                  | 전 경로                                     | id·cursor·parentId 타입                                                  |
| upload                   | presign 경로 전체                           | —                                                                        |
| notice / adoption-review | (프론트 미사용 — 전환 대상 아님)            | —                                                                        |

핵심 변경 동인 4가지: ① v2는 `setGlobalPrefix` 없음 ② 응답 페이지네이션 `PageV2`(items/hasNext, 1-base) 표준 ③ user 도메인을 auth에서 모듈 분리 ④ PK가 auto-increment(number) → uuid(string).

---

## 1. 전역 (baseURL)

| 항목    | as-is               | to-be           | 구분     |
| ------- | ------------------- | --------------- | -------- |
| baseURL | `http://…:8080/api` | `http://…:3000` | **변경** |

**상세** — v2 백엔드는 `setGlobalPrefix('api')`를 두지 않는다(컨트롤러 경로가 곧 최종 경로). 따라서 프론트 baseURL의 `/api` 접두사를 제거해야 모든 도메인 호출이 매칭된다. 포트도 v2 기본 3000으로. (`.env.local`, gitignore라 커밋에는 미포함)

---

## 2. adopt (입양공고)

| 항목                 | as-is                                 | to-be                          | 구분     |
| -------------------- | ------------------------------------- | ------------------------------ | -------- |
| 목록                 | `v2/abandonments`                     | `/abandonments`                | **변경** |
| 상세                 | `v2/abandonments/:id`                 | `/abandonments/:id`            | **변경** |
| 찜 목록              | `/me/favorite-abandonments`           | `/abandonments/favorites`      | **변경** |
| 찜 토글(POST/DELETE) | `/abandonments/:desertionNo/favorite` | 동일                           | 유지     |
| 목록 응답 envelope   | `{ value, has_next }`                 | `{ items, hasNext }`           | **변경** |
| 페이지 base          | 0-base (`initialPageParam: 0`)        | 1-base (`initialPageParam: 1`) | **변경** |
| id                   | `string`                              | `string`                       | 유지     |

**상세**

- **경로**: `v2/` 접두사는 구 keeper-api에서 v1/v2 공존 위해 붙던 잔재. v2 단독이므로 제거.
- **찜 목록**: 구 `/me/favorite-*` 패턴 → v2는 리소스 하위 `/abandonments/favorites`로 통일.
- **envelope**: 구 `{ value, has_next }` → v2 `PageV2 { items, total, page, size, hasNext }`. 소비처(`use-adopt`, `use-adopt-list`, `use-shelter-adopt-list`)의 `.value`→`.items`도 함께 수정.
- **page base**: v2 `PageV2`는 `page * size < total`로 hasNext 계산 → 1-base. 0-base로 첫 요청 시 빈/중복 페이지 위험이라 1로.

---

## 3. shelter (보호소)

| 항목                     | as-is                           | to-be                        | 구분           |
| ------------------------ | ------------------------------- | ---------------------------- | -------------- |
| 목록/검색/상세/카운트    | `/v2/shelters*`                 | `/shelters*`                 | **변경**       |
| 찜 목록                  | `/me/favorite-shelters`         | `/shelters/favorites`        | **변경**       |
| 찜 토글(POST/DELETE)     | `/shelters/:careRegNo/favorite` | 동일                         | 유지           |
| 찜 목록 envelope         | `{ items, hasNext }`            | 동일                         | 유지 (이미 v2) |
| 보호소공고 envelope·page | `{ value, has_next }`, 0-base   | `{ items, hasNext }`, 1-base | **변경**       |
| id                       | `string` (careRegNo)            | `string`                     | 유지           |

**상세** — adopt와 동일한 동인(`/v2/` 제거, 찜목록 경로 통일). 보호소 상세 안의 "그 보호소 공고 목록"은 adopt 응답 구조를 공유하므로 envelope·page가 함께 바뀜. 찜 목록 응답은 이미 `items/hasNext`였어 **그대로 유지**.

---

## 4. auth / user

| 항목           | as-is                              | to-be                               | 구분     |
| -------------- | ---------------------------------- | ----------------------------------- | -------- |
| 로그인         | `POST /auth/login`                 | 동일                                | 유지     |
| 약관 동의      | `POST /auth/agree`                 | 동일                                | 유지     |
| 토큰 리프레시  | `POST /auth/refresh`               | 동일                                | 유지     |
| 로그아웃       | `POST /auth/logout`                | 동일                                | 유지     |
| 내 정보 조회   | `GET /auth/me`                     | `GET /users/me`                     | **변경** |
| 내 정보 수정   | `PATCH /auth/me`                   | `PATCH /users/me`                   | **변경** |
| 회원 탈퇴      | `DELETE /auth/me`                  | `DELETE /users/me`                  | **변경** |
| 닉네임 중복    | `POST /auth/check-nickname` (body) | `GET /users/check-nickname` (query) | **변경** |
| 회원가입       | `POST /auth/signup`                | **제거**                            | **변경** |
| User id        | `number`                           | `string` (uuid)                     | **변경** |
| login nickname | `string`                           | `string \| null`                    | **변경** |

**상세**

- **user 모듈 분리**: v2는 프로필 관련을 `/users` 도메인으로 분리. me 3종(조회/수정/탈퇴)·닉네임중복이 `/auth`→`/users`로 이동. login·agree·refresh·logout은 인증 행위라 `/auth`에 **그대로 유지**.
- **닉네임 중복(메서드 변경)**: 조회성 작업이라 v2에서 `POST`(body) → `GET`(query `?nickname=`). 프론트 `checkNickname({nickname})` 호출 시그니처는 유지하고 내부만 GET+query로 바꿔 호출처 무변경.
- **회원가입 제거**: 구 흐름은 login→checkNickname→`signup`(닉네임+약관). v2는 login→`agree`(약관만, 닉네임 자동 생성)로 흡수. `signup` 함수는 이미 호출처 없는 dead code였어 제거(닉네임은 이후 `updateMe`로 변경).
- **id number→string**: v2 User PK가 uuid. `UserSchema.id`, `LoginUserPartial.id` number→string.
- **login nickname null**: v2 login 응답이 신규(isNew=true)일 때 `nickname: null`을 보냄 → `z.string().nullable().optional()`.

---

## 5. community / comment

| 항목                      | as-is                                                       | to-be                             | 구분           |
| ------------------------- | ----------------------------------------------------------- | --------------------------------- | -------------- |
| 게시글 목록/상세          | `/community/posts`, `/community/posts/:id`                  | 동일                              | 유지           |
| 작성/수정/삭제            | `/community/posts/{adoption-personal,qna,…}`                | 동일                              | 유지           |
| 좋아요/신고               | `/community/posts/:id/{like,report}`                        | 동일                              | 유지           |
| 목록 응답 envelope        | `{ items, hasNext }`                                        | 동일                              | 유지 (이미 v2) |
| 댓글 전 경로              | `/community/posts/:id/comments`, `/community/comments/:id*` | 동일                              | 유지           |
| 내 좋아요 글              | `/me/liked-posts`                                           | `/community/posts/my/liked-posts` | **변경**       |
| 도움된 댓글               | `/me/helpful-comments`                                      | `/community/me/helpful-comments`  | **변경**       |
| 차단 목록                 | `/me/blocks`                                                | `/community/me/blocks`            | **변경**       |
| 차단 토글                 | `/users/:userId/block`                                      | `/community/users/:userId/block`  | **변경**       |
| post / comment / user id  | `number`                                                    | `string` (uuid)                   | **변경**       |
| comment cursor / parentId | `number`                                                    | `string`                          | **변경**       |

**상세**

- **`/me/*` → 도메인 하위 이동**: 구 keeper-api의 글로벌 `/me/*` 모음을 v2는 각 도메인 컨트롤러 아래로. 내좋아요글은 `community/posts` 하위, 도움댓글·차단은 `community` 하위.
- **차단 경로**: v2 block 컨트롤러가 `@Controller('community')`라 `/community/users/:id/block`. as-is의 `/community` 누락은 차단 404를 유발 — 재검수에서 P0로 잡아 수정.
- **id number→string(파급)**: post/comment/user PK uuid화. 스키마뿐 아니라 이를 소비하는 컴포넌트 props·라우트 param·queryKey·콜백·optimistic 캐시(`patch-like-cache`/`patch-helpful-cache`의 `Number(id)` 비교 제거)까지 전수 string화.
- **게시글 목록 envelope·댓글 경로는 이미 v2 형태**라 **그대로 유지** (이전 사이클에 정합됨). 이번엔 id 타입만 영향.

---

## 6. upload

| 항목         | as-is                   | to-be | 구분 |
| ------------ | ----------------------- | ----- | ---- |
| presign 발급 | `POST /uploads/presign` | 동일  | 유지 |

전환 변경 없음 — 경로·계약 그대로.

---

## 7. 백엔드 보강 (to-be 측 변경)

프론트 정합과 별개로, **as-is에는 있었으나 v2에 누락됐던** 개발자 로그인을 복원.

| 항목                           | as-is(구 keeper-api) | v2 직전  | 조치 |
| ------------------------------ | -------------------- | -------- | ---- |
| `POST /auth/dev-login/:userId` | 있음                 | **누락** | 복원 |

- `auth.service.devLogin(seed)`: `dev-{seed}` socialId로 dev user upsert + 토큰 발급
- `auth.controller`: `NODE_ENV` allow-list 가드(local/development만, production 404)
- `env.schema`에 `NODE_ENV` 추가, devLogin 단위 테스트 추가
- post 컨트롤러 라우트 순서(`:id`를 `my/*` 아래로) 방어적 정리, e2e를 `/health` envelope 검증으로 교체

---

## 8. 검증 (부록)

| 검증                               | 결과                                                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| keeper-app tsc / eslint / jest     | 0 / 0 / **449 통과** (worklets mock으로 26 suite 복구 포함)                                                      |
| keeper-backend tsc / eslint / jest | 0 / 0 / **118 통과**                                                                                             |
| 실 서버 v2 부팅                    | 전 라우트 매핑 + `/health` envelope 정합                                                                         |
| MCP 시뮬 E2E (iPhone 17)           | 홈 공고(`/abandonments`)·보호소(`/shelters`)·커뮤니티(`/community/posts`)·프로필 dev-login+`/users/me` 화면 실증 |

재귀 검수 발견·조치: **P0** dev-login fail-open(allow-list로 수정), 차단 경로 누락(수정) / **P1** 라우트 순서(재배치), nickname nullable(정당) / **P2** test page:0(정리), patch-favorited-cache value fallback(무해 잔존).

---

## 9. 잔여·후속

1. **patch-favorited-cache `value` fallback (P2)** — 모든 응답이 `items`라 dead path. 범용 방어 헬퍼라 잔존.
2. **백엔드 supertest e2e** — `jose` 등 ESM 의존성 transform 미설정으로 실행 불가. 실 서버 부팅 검증으로 대체. (백로그)
3. **Railway 배포(익일)** — 배포 환경변수에 `NODE_ENV=production` 필수(dev-login 차단).
