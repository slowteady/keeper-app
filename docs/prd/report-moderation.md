# PRD: 신고 처리 (운영자 모더레이션)

## 1. 메타

- 작성일: 2026-06-19
- 상태: 초안
- 입력 백로그: docs/backlog/features/report-moderation.md
- 관련: [[admin-console]](셸·후속 슬라이스) · [[00-notification-system]](통지 의존) · product-roadmap F-01(사용자측 신고후속) · 정보통신망법 §44조의2
- 코드베이스: admin 프론트=별도 레포 keeper-admin(Refine+shadcn). 백엔드=keeper-backend(develop→dev-api). keeper-app FSD 범위 밖.

## 2. Problem / Why

- 사용자 신고(`post_report`/`comment_report`)는 **접수만 되고 운영자 처리 화면·API가 0**. 신고된 글/댓글이 계속 노출됨.
- UGC(개인입양 공고·커뮤니티 글/댓글)를 받는 이상 처리 수단은 **법적 의무** — 정보통신망법 §44조의2는 규모·비영리 예외 없이 임시조치·통지·약관 명시를 요구.
- admin 콘솔(문의 답변 슬라이스) 셸이 이미 있어 신고 큐를 얹는 비용이 작음. 신고처리는 알림 시스템의 trigger(임시조치→통지)이기도 함.

## 3. Goals / Non-Goals

### Goals

- 운영자가 **신고를 한 곳(큐)에서 보고 임시조치(블라인드)·삭제·기각**할 수 있다.
- 같은 대상 **다중 신고를 집계**해 한 줄로 본다(신고수·사유).
- §44-2 임시조치(접근차단=isHidden) + 약관 절차 명시로 **법적 최소선**을 갖춘다.

### Non-Goals (이번 안 함 — 사유)

- **통지(신고자/게시자)** — 알림 시스템(인앱 알림함=종 아이콘 알림센터) 의존. 미구축. 이번엔 이벤트 인터페이스만 두고 알림 완성 후 알림함 항목으로 연결.
- **이의제기 전용 기능** — 기존 1:1 문의(type=APPEAL) 재활용(당근 모델). 신규 빌드 X.
- **반복 위반자 자동 BAN** — 후속(유저 관리 슬라이스 + user violation 컬럼). 자동 BAN은 인간 확인 필요.
- **다중신고 임계 자동 블라인드** — 후속 옵션. 1인 운영은 수동 검토 우선.
- **F-01 사용자측 신고후속**(본인 피드 숨김·"신고됨" 표시) — 별도 슬라이스(keeper-app). admin 큐 먼저.
- **IN_REVIEW 상태** — 1인 운영엔 과함. PENDING→RESOLVED 직행.

## 4. Success Metrics

- 정량: 미처리 신고 0 유지(처리율), 신고→처리 평균 소요(§44-2 "지체 없이").
- 정성: 운영자가 DB(Prisma Studio) 안 만지고 신고 처리, 블라인드된 콘텐츠가 사용자 피드에서 사라짐.

## 5. User Scenarios

### 페르소나

- **운영자(오너/협력자, ADMIN)**: 신고를 검토하고 조치하는 사람.

### 시나리오 (Given-When-Then)

- Given 글에 신고 3건 누적, When 운영자가 신고 큐 진입, Then 그 글이 신고수 3·사유 요약·미처리로 한 줄 표시된다.
- Given 운영자가 신고 상세 진입, When 콘텐츠·신고들 확인 후 "블라인드", Then 글 `isHidden=true`, 관련 신고들 `handledAt`·`handledAction=HIDE` 기록, 상태 완료, 사용자 피드에서 숨겨진다.
- Given 신고가 부당, When "기각", Then `handledAction=NONE` 기록, 콘텐츠 유지.
- Given 명백 위반, When "삭제", Then 콘텐츠 영구 삭제.
- (알림 시스템 후) 임시조치 시 게시자=사유+이의 / 신고자=결과만 알림함 통지.

## 6. Functional Requirements

### P0 (이번 슬라이스)

- **FR-1. 신고 큐(집계)** — As 운영자, 신고된 글/댓글을 대상별로 묶어 보고 싶다.
  - AC: `GET /admin/reports` — 대상(글/댓글) 단위 집계: 대상 식별·유형(POST/COMMENT)·신고수·대표 사유(들)·최신 신고시각·처리상태(미처리/완료).
  - AC: 미처리 우선 정렬(신고수 보조).
- **FR-2. 신고 상세** — As 운영자, 콘텐츠와 신고 내역을 보고 조치하고 싶다.
  - AC: `GET /admin/reports/:type/:id` — 대상 콘텐츠(원문) + 신고 목록(사유·상세·신고시각) + 현재 isHidden/처리상태.
- **FR-3. 임시조치 액션** — As 운영자, 블라인드/삭제/기각하고 싶다.
  - AC: `POST /admin/reports/:type/:id/handle {action: HIDE|DELETE|NONE}` — 대상의 관련 신고 전부 `handledAt`(now)·`handledAction` 일괄 기록.
  - AC: HIDE → 대상 `isHidden=true`(임시조치). DELETE → 콘텐츠 삭제. NONE → 콘텐츠 유지(기각).
  - AC: 통지 이벤트 발행(인터페이스만, 알림 시스템 연결 전 no-op).
- **FR-4. 상태** — 처리 전 PENDING(handledAt null), 처리 후 RESOLVED.
- **FR-5. 약관 명시** — terms.md에 §44-2 임시조치 절차(블라인드 30일 이내·양 당사자 통지·이의=1:1 문의) 기재.

### P1 (다음)

- 통지(알림 연결), 반복 위반자 BAN, 다중신고 임계 자동 블라인드, F-01 사용자측 신고후속.

UX 화면: keeper-admin(Refine+shadcn) reports resource — `/design`에서 설계.

## 7. Data Model (확정)

- **신규 테이블 없음.** 기존 재활용:
  - `post_report`/`comment_report` — `reason`(enum), `reasonDetail`, `handledAt`, `handledAction`(ReportAction), `reporterUserId`, FK.
  - `ReportAction` enum(NONE/HIDE/DELETE/BAN).
  - `post.isHidden` — 임시조치(접근차단).
- **마이그레이션 1건**: `PostComment.isHidden Boolean @default(false)` 추가(댓글 블라인드용. Post엔 이미 존재).
- 집계 키 = **대상별**(targetType POST/COMMENT + targetId). reason은 집계 내 요약 표시.

## 8. Backend Impact (keeper-backend, 로컬→develop)

### 마이그레이션

- `<timestamp>_add_comment_is_hidden` — `comment.is_hidden` 컬럼 추가.

### API / 모듈

- `src/modules/community/`(기존 report.controller/service 옆) 또는 신규 admin report 컨트롤러:
  - `GET /admin/reports` — 집계 큐(post_report·comment_report group by 대상).
  - `GET /admin/reports/:type/:id` — 대상 콘텐츠 + 신고 목록.
  - `POST /admin/reports/:type/:id/handle` — 처리(handledAt/handledAction 일괄 + isHidden/삭제).
  - 전부 `@Roles(ADMIN)` + RolesGuard.
- **통지 이벤트**: 임시조치 시 발행할 인터페이스 정의만(알림 시스템 의존, no-op).

### 영향 범위

- 사용자 피드/상세 조회에서 `isHidden=true` 글·댓글 **제외**(이미 일부 처리 여부 확인 → 미적용분 보강).
- 삭제(DELETE) 정책: 기존 글 삭제 cascade(댓글·신고·좋아요) 정합 확인.

## 9. Rollout Plan (Phase)

### Phase 0: 이번 슬라이스

- PostComment.isHidden 마이그레이션 + admin report API + admin 콘솔 신고 큐/상세/처리 + terms.md 약관.
- 출시 신호: 운영자가 신고를 큐에서 블라인드/삭제/기각, 블라인드 콘텐츠가 피드에서 사라짐.

### Phase 1: 통지 연결 (알림 시스템 후)

- 임시조치 이벤트 → 인앱 알림함 통지(게시자=사유+이의 / 신고자=결과만 비대칭).

### Phase 2: 확장

- 반복 위반자 BAN, 다중신고 임계 자동 블라인드, F-01 사용자측.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정           | 옵션                            | 채택              | 사유                                                                                  |
| -------------- | ------------------------------- | ----------------- | ------------------------------------------------------------------------------------- |
| 임시조치 기본  | 즉시 삭제 vs 블라인드(isHidden) | 블라인드 우선     | §44-2 면책 요건(접근차단·복구가능). 삭제는 명백 위반만                                |
| 통지           | 이번 포함 vs 알림 후            | 알림 후           | 통지=인앱 알림함 항목. 알림 시스템 미구축 → 이벤트 인터페이스만                       |
| 이의제기       | 전용 기능 vs 문의 재활용        | 1:1 문의(APPEAL)  | 당근 모델. 신규 빌드 불필요                                                           |
| 검토 방식      | 자동 임계 vs 수동               | 수동 우선         | 1인 운영 단순·오판 리스크. 자동은 후속                                                |
| 집계 키        | reason별 vs 대상별              | 대상별            | 같은 글 다중신고를 한 줄로(Reddit/Blind). reason은 요약                               |
| 30일 만료 처리 | 자동복구 vs 운영자 수동         | 운영자 수동(이번) | 자동복구 로직 복잡. §44-2 30일은 약관 명시 + 운영자 신속 처리로 충족. 자동만료는 후속 |
| BAN            | 이번 vs 후속                    | 후속              | user violation 컬럼·유저관리 슬라이스 필요. 자동 BAN은 인간확인                       |

### Open Issues (→ /spec)

- TBD — 신고 reason과 §44-2 "권리침해 소명"의 구분: PRIVACY/명예성 신고만 §44-2 엄격절차(통지·30일) 적용할지, 전 신고 동일 처리할지. (MVP는 동일 큐·동일 액션, 통지는 알림 후 일괄)
- TBD — `GET /admin/reports` 응답에서 글/댓글 혼합 큐 정렬·페이지네이션 규약(react-admin/Refine dataProvider 매핑).
- TBD — DELETE 시 cascade 범위(신고 레코드 보존 여부 — 처리 이력 감사용).

## 참고

- 백로그: `docs/backlog/features/report-moderation.md`
- 레퍼런스 BP: 정보통신망법 §44-2(CaseNote/IT위키) · 당근 이의신청 · Reddit/Blind 집계·비대칭통지 · Discord enforcement ladder
- 백엔드: `keeper-backend/src/modules/community/report.*`, `prisma/schema.prisma`(post_report/comment_report·isHidden·ReportAction)
