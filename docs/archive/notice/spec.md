# Spec: 공지사항 (notice) — 데이터 · 백엔드 · API

> 입력: docs/prd/notice.md, docs/design/notice.md. 멀티 레포: keeper-app(zod·API흐름) · keeper-backend(마이그레이션·API·admin) · keeper-admin(작성 화면).

## 1. Data Model (keeper-backend, Prisma)

`Notice` ALTER (현재 `id·title·content·createdAt·updatedAt`):

| 컬럼       | 타입                                 | 제약               | 사유                     |
| ---------- | ------------------------------------ | ------------------ | ------------------------ |
| `type`     | `NoticeType` enum(`NORMAL`,`URGENT`) | `@default(NORMAL)` | 일반/긴급 구분           |
| `images`   | `String[]`                           | `@default([])`     | 이미지 N장(R2 URL 배열)  |
| `isActive` | `Boolean`                            | `@default(true)`   | 노출 제어(운영자 on/off) |

- enum `NoticeType { NORMAL URGENT }` 신규.
- **만료 자동(expiresAt)은 Non-Goal** — isActive 토글로 충분(1인 운영). 후속 여지.
- 마이그레이션: Prisma `migrate dev`(timestamp 자동, 번호 예약 불필요). 마지막 = `20260619141843_multi_session_refresh_token`.

## 2. Backend Impact (keeper-backend)

### 기존 확장

- `notice.converter`: list 응답에 `type` 추가(목록 뱃지용), detail 응답에 `type`·`images` 추가.
- `notice.service.findList`: `where: { isActive: true }`, 최신순(`createdAt desc`). list=content 제외 유지.
- `notice.service.detail`: images 포함.

### 신규 — admin CRUD

- `GET /admin/notices` (@Roles ADMIN) — 비활성 포함 전체 목록(isActive 포함). keeper-admin 목록용.
- `GET /admin/notices/:id` (@Roles ADMIN) — 비활성 포함 상세(isActive 포함). keeper-admin 수정 prefill용.
- `POST /admin/notices` (@Roles ADMIN) — `{ type, title, content, images }` 생성.
- `PATCH /admin/notices/:id` (@Roles ADMIN) — 수정(isActive 토글 포함).
- `DELETE /admin/notices/:id` (@Roles ADMIN) — 삭제.
- 이미지 업로드: 기존 R2 presign 재사용(클라가 `POST /uploads/presign` → R2 PUT → publicUrl 배열 전달).

### 긴급 조회 — bootstrap 통합 (확정)

- `/bootstrap` 응답에 `urgentNotice: { id, title, content, images } | null` 추가.
- 산출: `type=URGENT AND isActive=true` 중 **최신 1건**. 없으면 null.
- **사유**: appGate가 앱 진입 시 bootstrap을 이미 1회 호출 → 별도 endpoint 추가 라운드트립 없이 즉시 판단. (별도 `GET /notices?type=URGENT` 컷)

## 3. 프론트 API 흐름 (keeper-app)

### entities/notice

- `schema.ts`: `NoticeType`(`NORMAL`|`URGENT`), `NoticeListItemDto`(id,type,title,createdAt), `NoticeDetailDto`(+content,images), `UrgentNoticeDto`(id,title,content,images).
- `api.ts`: `noticeApi.getNotices(page,size)`·`getNotice(id)`. `noticeQueries.list()`·`detail(id)` factory.
- 긴급공지는 별도 호출 없음 — `bootstrap` 응답(useAppGate)에서 수신.

### features/notice/model

- `useNoticeList`: `useQuery(noticeQueries.list())` — 홈 카드(최신 N)·프로필 리스트 공유.
- `useNoticeDetail(id)`: `useQuery(noticeQueries.detail(id))`. 진입 시 `useReadNotices.markRead(id)`.
- `useReadNotices`: expo-secure-store 키 `noticeReadIds`(읽은 id 배열 JSON) — 읽음 dimmed(서버 동기 X).
- `useUrgentNoticeGate`: `useAppGate` `status==='ok'` + `urgentNotice` 있고 미dismiss → `useBottomSheet.present(<UrgentNoticeSheet/>)`. dismiss 시 secure-store 키 `noticeUrgentDismissedIds`(dismiss한 id 배열)에 추가. 새 id면 재노출.
- **저장소**: AsyncStorage 미설치 → 프로젝트 컨벤션 `expo-secure-store`(app-gate soft-throttle와 동일). 키는 secure-store 규칙(영숫자·`._-`만, 콜론 불가)에 맞춰 per-id 키가 아닌 **단일 배열 키** 사용.
- 에러: interceptor 기존, 상세 404 → DetailErrorBoundary.

### useAppGate 확장

- `GateState`에 `urgentNotice` 추가, bootstrap 응답에서 매핑. gate 전면(maintenance/hard/soft)이면 긴급 시트 보류(직렬).

## 4. 스키마 3중 검증

| 필드                   | keeper-app zod            | keeper-backend DTO | DB                       |
| ---------------------- | ------------------------- | ------------------ | ------------------------ |
| type                   | `'NORMAL'\|'URGENT'`      | nestjs-zod 동일    | `NoticeType` enum        |
| images                 | `string[]`                | 동일               | `String[]` @default([])  |
| isActive               | (admin DTO만)             | `boolean`          | `Boolean` @default(true) |
| title/content          | string                    | string             | String                   |
| createdAt              | string(ISO)               | Date               | Timestamptz              |
| bootstrap.urgentNotice | `UrgentNoticeDto \| null` | 동일               | 파생(쿼리)               |

- list 응답: content 제외 + type 포함. detail: content+images. 불일치 없음(신규 필드 양쪽 추가).

## 5. 테스트 시나리오

- **목록**: isActive=true만 최신순 반환, content 제외 + type 포함.
- **상세**: images 포함. 없는 id → NOT_FOUND(404).
- **비활성 제외**: isActive=false 공지는 목록·상세·bootstrap에서 제외.
- **bootstrap 긴급**: 활성 URGENT 최신 1건 `urgentNotice`로 반환, 없으면 null. 일반(NORMAL)은 미포함.
- **admin CRUD**: 비ADMIN 403, 생성/수정/삭제 정상.
- **앱**: gate ok + urgentNotice 미dismiss → 시트. dismiss 후 같은 id 재노출 X, 새 id 재노출. gate(점검/업뎃) 떠 있으면 시트 보류.
- **읽음**: 상세 진입 후 목록 dimmed(로컬).

## 6. 변경 파일 (구현 입력)

keeper-app(신규): `entities/notice/{schema,api}.ts`·`ui/{notice-card,notice-list-item,notice-type-badge}.tsx`, `features/notice/model/{use-notice-list,use-notice-detail,use-read-notices,use-urgent-notice-gate}.ts`·`ui/{notice-detail-content,urgent-notice-sheet}.tsx`, `widgets/home-section/ui/home-notice-section.tsx`, `app/(untabs)/profile/notice/[id].tsx`. 수정: `widgets/profile/ui/profile-notice-scene.tsx`, `features/app-gate`(urgentNotice), `app/(tabs)/home`(SECTIONS), `app/_layout`(urgent gate).

keeper-backend(별도): Notice 마이그레이션, converter/service 확장, admin notice controller, bootstrap 확장.
keeper-admin(별도): 공지 작성 화면.

## 7. ADR

- **bootstrap 통합(별도 endpoint X)**: appGate 1회 호출 재사용, 진입 즉시 판단.
- **isActive만(expiresAt X)**: 1인 운영 토글 충분, 만료 자동은 후속.
- **읽음/dismiss 로컬**: 서버 동기 과함.
- **긴급 최신 1건**: 다수 동시 활성 시 시트 1개만(스택 모달 금지 BP).

## Open Issues

- keeper-admin 공지 작성 화면은 별도 레포 트랙(이미지 업로드 UX).
- 긴급공지 우선순위(다수 활성 시 최신 외 정렬 기준) — 현재 최신 1건 고정.
