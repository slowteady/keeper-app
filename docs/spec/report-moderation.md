# Spec: 신고 처리 (운영자 모더레이션)

## 1. 메타

- 작성일: 2026-06-19
- 상태: 확정
- 입력: docs/prd/report-moderation.md + docs/design/report-moderation.md
- 백엔드: keeper-backend (NestJS + Prisma, develop=prod 자동배포 → 로컬 구현·로컬 적용까지만, push 금지)
- admin 프론트: keeper-admin (별도 레포, Refine + shadcn). keeper-app FSD 범위 밖.

## 2. Data Model (확정)

### 신규 테이블: 없음

기존 재활용 (현 스키마 확인 완료):

- `PostReport` — `id(uuid7)`, `postId`, `reporterUserId`, `reason(ReportReason)`, `reasonDetail(VarChar 500, nullable)`, `handledAt(Timestamptz, nullable)`, `handledAction(ReportAction, nullable)`, `createdAt`. `@@unique([postId, reporterUserId])`, `@@index([handledAt])`. `post` FK `onDelete: Cascade`.
- `CommentReport` — 동형. `commentId` FK → `PostComment` `onDelete: Cascade`.
- `ReportReason` enum — SPAM / ABUSE / FRAUD / ANIMAL_ABUSE / PRIVACY / MONETARY / MISUSE.
- `ReportAction` enum — NONE / HIDE / DELETE / BAN.
- `Post.isHidden Boolean @default(false)` — 이미 존재. 피드/상세 조회에서 이미 제외 중.

### 마이그레이션 1건

`20260619000001_add_comment_is_hidden`

```
ALTER TABLE "post_comment" ADD COLUMN "is_hidden" BOOLEAN NOT NULL DEFAULT false;
```

- 마지막 적용 마이그레이션 = `20260618230327_inquiry_user_required_cascade`. +1 timestamp 예약.
- 컬럼 결정: `is_hidden BOOLEAN NOT NULL DEFAULT false`. nullable 아님 — `Post.isHidden`과 동일 규약(임시조치 미적용=false 명시, null 3-state 불필요).
- schema.prisma `PostComment` 모델에 `isHidden Boolean @default(false) @map("is_hidden")` 추가.
- 인덱스 불필요 — 댓글 조회는 항상 부모 글/대상 id 기준 필터, isHidden은 보조 조건.

### 집계 키

대상별 = `(targetType, targetId)`. targetType ∈ { POST, COMMENT }. reason은 집계 내 요약(대표사유 + 사유별 카운트).

## 3. Backend Impact (keeper-backend)

### 신규 파일 (community 모듈 내)

- `admin-report.controller.ts` — `@Roles(ADMIN)` + `@Controller('admin/reports')`. (AdminInquiryController 패턴 그대로)
- `admin-report.service.ts` — 집계·상세·handle 로직.
- `admin-report.dto.ts` — `HandleReportDto` (zod).
- `report-handled.event.ts` — 통지 이벤트 인터페이스 + no-op emitter.
- CommunityModule `controllers`에 `AdminReportController`, `providers`에 `AdminReportService` 등록.

### 엔드포인트

전부 `@Roles(ADMIN)` (RolesGuard는 전역 또는 컨트롤러 적용 — inquiry와 동일 패턴).

#### 3-1. `GET /admin/reports?page=&size=&status=`

집계 큐. `PageV2<ReportQueueItem>` 반환 (`toPageV2` 재사용).

- `status` 쿼리: `PENDING`(기본) / `RESOLVED` / `ALL`. 미지정 시 PENDING.
- 집계 전략 (MVP, 신고량 소규모 가정):
  1. `postReport.groupBy({ by: ['postId', 'reason'], _count: { _all: true }, _max: { createdAt: true } })` — 대상×사유 카운트.
  2. `postReport.groupBy({ by: ['postId'], where: { handledAt: null }, _count: { _all: true } })` — 미처리 신고 보유 대상 집합.
  3. CommentReport 동형 2쿼리 (`by: ['commentId', ...]`).
  4. 서비스 코드에서 대상별 reduce → `ReportQueueItem` 생성: 총 신고수(사유 카운트 합), 대표사유(최다 빈도, 동률 시 `_max.createdAt` 최신), 최신 신고시각(사유별 max의 max), 미처리여부(2·4 집합 포함 여부).
  5. status 필터(PENDING=미처리 보유만 / RESOLVED=미처리 없음만 / ALL=전체) → 정렬(미처리 우선, 신고수 desc 보조, 최신시각 보조) → `skip/take` 메모리 slice → `toPageV2`.
  6. 콘텐츠 미리보기: slice된 대상 id들로 `post.findMany`/`postComment.findMany`(select id, 본문/제목, isHidden) 일괄 조회 후 병합.
- ADR: 메모리 집계는 신고 소규모 전제. 대량화 시 raw SQL(`GROUP BY` + 윈도우) 전환 — Open Issue 아님, 후속 최적화로 명시.

`ReportQueueItem` 형태:

```
{
  id: string;            // `${type}:${targetId}` — Refine record id (복합키)
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  contentPreview: string; // 본문 발췌(글=title 우선/본문, 댓글=body). 최대 N자
  isHidden: boolean;      // 대상 현재 블라인드 상태
  reportCount: number;
  primaryReason: ReportReason;
  reasonCounts: Record<ReportReason, number>; // 사유별 카운트(0 생략)
  latestReportedAt: string; // ISO
  pending: boolean;        // 미처리 신고 보유
}
```

#### 3-2. `GET /admin/reports/:type/:id`

- `:type` ∈ { post, comment } (소문자 path). `:id` = targetId(uuid).
- 응답 `ReportDetail`:

```
{
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  content: {            // 원문
    id, authorNickname, body, images?: string[], createdAt, isHidden
  };
  reports: Array<{ id, reason, reasonDetail, reportedAt, handledAt, handledAction }>;
  pending: boolean;
}
```

- 대상 없음 → 404 (`PostNotFoundException`/`CommentNotFoundException` 재사용).
- 신고 0건이어도 대상 존재 시 200(빈 reports). 단 큐 진입은 신고 존재 대상만이라 정상 흐름에선 ≥1.

#### 3-3. `POST /admin/reports/:type/:id/handle`

Body: `HandleReportDto { action: 'HIDE' | 'DELETE' | 'NONE' }` (zod enum).

- 트랜잭션(`prisma.$transaction`):
  - **HIDE** — 대상 `isHidden=true` 업데이트 + 해당 대상의 신고 중 `handledAt=null`인 것들 `handledAt=now, handledAction=HIDE` 일괄. 통지 이벤트 발행(HIDE).
  - **NONE**(기각) — isHidden 변경 없음. 미처리 신고들 `handledAt=now, handledAction=NONE` 일괄. 통지 이벤트 발행(NONE).
  - **DELETE** — 대상 콘텐츠 `delete`. cascade로 댓글·좋아요·신고 레코드 동반 삭제. 통지 이벤트는 삭제 전 스냅샷으로 발행(DELETE). handledAction 기록은 레코드 소멸로 무의미 → 미기록.
- 반환: `{ action, isHidden }` (NONE/HIDE) 또는 `{ action: 'DELETE', deleted: true }`.
- 멱등: 이미 처리된(미처리 신고 0) 대상에 HIDE/NONE 재요청 시 isHidden만 갱신, 신고 일괄 업데이트는 0건(에러 아님).

#### 통지 이벤트 인터페이스 (no-op)

```ts
interface ReportHandledEvent {
  targetType: 'POST' | 'COMMENT';
  targetId: string;
  authorUserId: string;
  reporterUserIds: string[];
  action: 'HIDE' | 'DELETE' | 'NONE';
  handledAt: Date;
}
```

- `ReportHandledEmitter.emit(event)` — 현재 no-op(로그만/빈 구현). 알림 시스템(B-2) 완성 후 인앱 알림함 항목 발행으로 연결.
- 비대칭 통지(게시자=사유+이의 / 신고자=결과만)는 이벤트 소비 측(알림)에서 분기 — 이번엔 데이터만 실어 발행.

### 영향 범위 보강

- **comment.service.ts** — 댓글 조회(목록/상세)에 `isHidden: false` 필터 추가. 현재 댓글 자체 isHidden 없어 미적용 → 마이그레이션 후 where 조건 보강. (부모 글 isHidden 차단 로직은 이미 존재 — 유지)
- **post.service.ts** — 이미 `isHidden: false` 제외 적용 중(findList/detail/myPosts/likedPosts). 보강 불필요.

### DELETE cascade 정합 (확인 완료)

| 테이블                                  | onDelete             | Post 삭제 시          |
| --------------------------------------- | -------------------- | --------------------- |
| PostComment / PostLike / PostAdoption\* | Cascade              | 동반 삭제             |
| PostReport                              | Cascade              | 신고 레코드 동반 삭제 |
| CommentReport                           | Comment Cascade 연쇄 | 동반 삭제             |

- DELETE 시 신고 레코드도 소멸 → **처리 이력 감사 불가**. MVP는 cascade 그대로 수용(ADR). 감사 보존 필요 시 후속에 별도 `moderation_log` 스냅샷 또는 FK `SetNull` 전환 — 이번 비포함.

## 4. Refine dataProvider 매핑 (keeper-admin)

리소스 `reports` 추가. 기존 `dataProvider.ts`는 generic.

- **getList** — 현 generic 그대로 사용 가능. 백엔드가 각 item에 `id="${type}:${targetId}"` 합성해 내려줌 → `{ data: page.items, total: page.total }` 그대로. status 필터는 list 화면에서 쿼리파라미터 전달(현 generic getList는 filters 미전달 → **getList에 status 쿼리 전달 보강** 또는 list 화면 client 필터. MVP=문의 패턴 따라 pageSize 크게 받고 client status 필터 → 백엔드 status는 기본 PENDING만 우선, 필요 시 보강).
- **getOne** — `reports` 분기 추가: 복합 id를 `:`로 분해 → `/admin/reports/${type.toLowerCase()}/${targetId}`. (다른 리소스는 기존 `/admin/${resource}/${id}` 유지)
- **handle** — dataProvider 밖. `src/providers/report-actions.ts`의 `handleReport(type, id, action)` = `apiFetch('/admin/reports/${type}/${id}/handle', { method:'POST', body })`. (inquiry-actions.ts 패턴)

확정: dataProvider getOne에 resource==='reports' 분기 1곳 추가. getList는 백엔드 합성 id 전제로 무변경(status는 client 필터 우선, 백엔드 status 쿼리 지원은 보강 옵션).

## 5. 스키마 3중 검증

| 필드              | DB (Prisma)                                 | 백엔드 응답/DTO                                          | Refine 소비 (keeper-admin)    | 정합                              |
| ----------------- | ------------------------------------------- | -------------------------------------------------------- | ----------------------------- | --------------------------------- |
| reason            | `ReportReason` enum 7종                     | `ReportQueueItem.primaryReason` / `reasonCounts` 키      | `REASON_LABEL` 7종 매핑       | ✅ (constants/report.ts 7종 동일) |
| action            | `ReportAction`(NONE/HIDE/DELETE/BAN)        | `HandleReportDto.action` zod enum **HIDE/DELETE/NONE만** | ReportActionBar 3버튼         | ✅ BAN은 이번 미노출(후속)        |
| isHidden(post)    | `Boolean NOT NULL @default(false)`          | `content.isHidden` / `ReportQueueItem.isHidden` boolean  | 상태 표시                     | ✅                                |
| isHidden(comment) | **신규** `Boolean NOT NULL @default(false)` | 동일                                                     | 동일                          | ✅ 마이그레이션 후                |
| handledAt         | `Timestamptz nullable`                      | `reports[].handledAt` ISO\|null, `pending` 파생          | 처리상태 Badge                | ✅                                |
| 복합 id           | (DB엔 없음, 응답 합성)                      | `id="${type}:${targetId}"`                               | Refine record id, getOne 분해 | ✅                                |
| reasonDetail      | `VarChar(500) nullable`                     | `reports[].reasonDetail` string\|null                    | 상세 표시                     | ✅                                |

불일치 없음. `HandleReportDto.action`은 DB enum의 부분집합(BAN 제외) — 의도된 좁힘, zod에서 3종만 허용.

## 6. 테스트 시나리오

### P0 (TDD 입력 — admin-report.service.spec.ts)

- **집계** — 같은 글에 reason 다른 신고 3건 → 큐 item 1개, reportCount=3, primaryReason=최다, latestReportedAt=최신, pending=true.
- **대표사유 동률** — 2건/2건 동률 → 더 최신 신고의 reason이 primaryReason.
- **글+댓글 혼합** — post 신고·comment 신고 각각 → item 2개, id가 `POST:..` / `COMMENT:..`.
- **status 필터** — handle 후 pending=false → status=PENDING 큐에서 제외, status=ALL/RESOLVED에 포함.
- **HIDE** — handle HIDE → post.isHidden=true, 미처리 신고 전부 handledAt 채워짐·handledAction=HIDE, 이벤트 1회 발행(HIDE).
- **NONE(기각)** — isHidden 불변, 신고 handledAction=NONE.
- **DELETE** — 대상 삭제, 관련 신고 cascade 소멸, 이벤트 발행(DELETE, 삭제 전 스냅샷).
- **댓글 블라인드** — comment handle HIDE → comment.isHidden=true, 이후 댓글 조회에서 제외.
- **상세** — `GET /admin/reports/post/:id` → content + reports[] 정합. 신고들 reason/reasonDetail/시각 포함.

### 엣지

- 비 ADMIN 토큰 → 403 (RolesGuard).
- 존재하지 않는 대상 handle/detail → 404.
- 이미 처리된 대상 재 handle(미처리 0건) → 200, 신고 업데이트 0건(멱등).
- 빈 큐(신고 0) → `PageV2 { items: [], total: 0 }`.
- handle 잘못된 action(BAN 등) → 400 (zod).

## 7. ADR (Decision Log)

| 결정                      | 옵션                                | 채택                            | 사유                                                                                                   |
| ------------------------- | ----------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| comment isHidden nullable | NULL 허용 vs NOT NULL default false | NOT NULL default false          | Post.isHidden과 동일 규약. 미적용=false 명시, 3-state 불필요                                           |
| 집계 실행                 | DB group by 페이지 vs 메모리 집계   | 메모리 집계(MVP)                | 1인 운영·신고 소규모. handledAt 미처리 판정+대표사유가 단일 group by로 안 나옴. 대량화 시 raw SQL 후속 |
| 대표사유 선정             | 최다 빈도 vs 최신                   | 최다 빈도(동률 최신)            | 모더레이션 큐 관례 — 가장 많이 지적된 사유 우선                                                        |
| 큐 잔류                   | 처리 후 제거 vs 상태 분류           | 상태 분류(PENDING/RESOLVED/ALL) | 문의 패턴 일관. 기본 PENDING, 필터로 완료 확인. 이력 유지                                              |
| DELETE 신고 보존          | cascade 수용 vs FK 전환             | cascade 수용(MVP)               | 스키마 변경 최소. 감사 보존은 후속 moderation_log                                                      |
| handle action 범위        | 4종(BAN 포함) vs 3종                | 3종(HIDE/DELETE/NONE)           | BAN=유저관리 슬라이스 의존. zod에서 좁힘                                                               |
| §44-2 권리침해 구분       | reason별 차등 절차 vs 동일          | 동일 큐·동일 액션(MVP)          | 통지 자체가 알림 후 — 절차 차등은 통지 연결 시점에                                                     |
| 복합 id 위치              | 백엔드 합성 vs 프론트 합성          | 백엔드 합성(`type:id`)          | getList generic 무변경. getOne만 분해 1곳                                                              |

### Open Issues 해소

- ✅ 대표사유 = 최다 빈도(동률 최신).
- ✅ 블라인드 후 = RESOLVED 분류(기본 큐 제외, status 필터로 확인).
- ✅ §44-2 구분 = MVP 전 신고 동일.
- ✅ DELETE cascade = 신고 소멸 수용, 감사 후속.

잔여 (후속, 이번 막힘 없음): 메모리 집계 → raw SQL 전환 임계, moderation_log 감사 테이블, BAN/자동임계.

## 참고

- PRD: docs/prd/report-moderation.md · Design: docs/design/report-moderation.md
- 백엔드 현황: PostReport/CommentReport·ReportAction·Post.isHidden 기존, PostComment.isHidden 신규
- 마이그레이션 기준: `20260618230327_inquiry_user_required_cascade`(마지막) → `20260619000001_add_comment_is_hidden`
