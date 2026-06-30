# PRD: 문의하기(고객지원/CS) 재설계

## 1. 메타

- 작성일: 2026-06-18
- 상태: 리뷰
- 입력 백로그: docs/backlog/features/00-inquiry-support.md
- 관련 PRD: [[ia-redesign]] (실종·목격 분리), 의존 기획 [[00-notification-system]] · [[admin-console]]

## 2. Problem / Why

- 프로필 → 문의하기에 폼·문의내역 UI가 있으나 **백엔드가 없어 동작하지 않는다**. 폼 `handleSubmit`은 무동작(`// TODO`), 문의내역은 `data=[]` 하드코딩. 출시 시 "등록을 눌러도 아무 일도 안 나는" 유령 기능이 노출된다.
- 1인·소수 운영에서 문의 창구는 신뢰의 마지막 보루다. 입양 절차·개인입양 법규·계정/로그인·신고 이의 등 실제 문의가 발생하는데 받을 곳이 없으면 이탈·앱스토어 악평으로 직결된다.
- 신고 처리(`moderation`)와 공지(`notice`, 구현 완료)가 이미 **운영자→사용자 단방향 통지** 패턴을 쓰고 있고, `00-notification-system.md`는 "신고 이의(appeal) 경로를 문의하기로 갈음"을 TBD로 남겨둠 → 문의하기가 이 공백을 메우는 자연스러운 채널.
- 시그널: 코드상 명백한 미완(스텁), IA 사이클 검수에서 프로필 탭 정합 항목으로 도출, notification 기획의 미결 의존.

## 3. Goals / Non-Goals

### Goals

- 사용자가 **실제로 문의를 보내고**, 운영자가 admin에서 받아 답할 수 있다.
- 문의내역에서 **상태(접수/처리중/완료) + 운영자 답변(피드백)을 인앱으로 확인**하고, 답변 시 **알림**을 받는다 (피드백 루프 닫기).
- 신고 이의제기·계정 문제를 한 채널로 모아 **1인 운영 부담을 최소화**한다.

### Non-Goals

- **이메일 전달 채널** — 안 함. 인앱 문의내역·답변 UI가 있으므로 불필요(사용자 결정 2026-06-18). 인앱 단일 채널이 루프가 닫혀 체감↑.
- **양방향 실시간 채팅(상담원)** — 안 함. 1인 운영 24/7 불가. 단방향 답변으로 충분.
- **AI 챗봇 디플렉션** — 안 함. 초기 규모 대비 과함.
- **FAQ/도움말 셀프서비스** — 이번엔 안 함(연기). 받는 채널을 먼저 세우고 문의 패턴이 쌓이면 후속 도입.
- **사용자 추가 답글(스레드 왕복)** — MVP 안 함. 운영자 답변 표시까지.

## 4. Success Metrics

- 정량: 문의 제출 성공률(제출→저장) ~100%, 답변 완료율(완료 처리된 문의 비율), 평균 첫 응답 시간.
- 정성: "보냈는데 답이 없다"류 재문의·악평 소멸, 문의내역에서 답변 열람 발생.

## 5. User Scenarios

### 페르소나

- **일반 사용자**: 입양 절차·계정·앱 오류가 궁금하거나 막힌 사람.
- **신고 당사자**: 본인 글/댓글이 제재돼 이의를 제기하려는 사람.
- **운영자(1인)**: 웹 admin에서 문의를 모아 보고 답하는 사람.

### 시나리오 (Given-When-Then)

- Given 로그인 사용자가 문의하기 진입, When 유형 선택 + 내용/이미지 작성 후 등록, Then 문의가 저장되고 "접수" 상태로 문의내역에 즉시 표시된다.
- Given 운영자가 admin에서 문의를 확인, When 답변 작성 + 상태를 완료로 변경, Then 사용자에게 알림(push+인앱)이 가고 문의내역에서 답변을 확인할 수 있다.
- Given 신고로 글이 제재된 사용자, When 문의하기에서 "이의제기" 유형으로 제출, Then 동일 흐름으로 운영자 검토·답변을 받는다.
- Given 비로그인 사용자가 문의하기 진입 시도, Then 로그인 유도(메뉴 `requireAuth: true` 유지).

## 6. Functional Requirements

### P0 (MVP)

- **FR-1. 문의 제출** — As a 사용자, 유형·내용·이미지로 문의를 보내고 싶다.
  - AC: 유형 필수 1개 선택 + 내용 1자 이상이어야 등록 활성화(기존 검증 유지).
  - AC: 제출 시 `POST /inquiries` 호출, 성공하면 문의내역 탭으로 이동/갱신 + 토스트.
  - AC: 이미지 최대 10장(기존 R2 presign 업로드 재사용).
- **FR-2. 유형 재정비** — 실종·목격 제외, `입양 / 계정·로그인 / 오류·버그 / 후원 / 제안 / 이의제기 / 기타`.
  - AC: 실종·목격 유형 제거(실종분실은 별도 기능).
- **FR-3. 문의내역 + 상태** — As a 사용자, 내가 보낸 문의와 진행 상태를 보고 싶다.
  - AC: `GET /inquiries/my` 목록, 각 항목에 상태 뱃지(접수/처리중/완료) + 유형 + 작성시각 + 요약.
  - AC: 항목 탭 → 상세(원문 + 운영자 답변).
- **FR-4. 운영자 답변 표시(피드백 UI)** — As a 사용자, 운영자 답변을 인앱에서 보고 싶다.
  - AC: 상세에 답변(1~N건) 표시. 답변 있으면 상태=완료(또는 처리중) 반영.
- **FR-5. 답변 알림** — As a 사용자, 답변이 오면 알림 받고 싶다.
  - AC: 운영자 답변 생성 시 push + 인앱 알림. (push는 알림 시스템 의존 — 아래 Rollout 참조)
  - AC: 알림 미가용 구간엔 최소 인앱 미읽음 표시(badge)로 graceful.
- **FR-6. admin 답변 처리** — As a 운영자, 문의를 보고 답하고 상태를 바꾸고 싶다.
  - AC: 웹 admin에서 문의 목록·상세·답변 작성·상태 변경(접수↔처리중↔완료).
- **FR-7. 이의제기 통합** — 신고 제재 사용자가 이의를 문의하기로 제출.
  - AC: 유형=이의제기. 관련 신고 건 연결 방식은 spec에서 확정(아래 Open Issue).

### P1 (다음)

- 사용자 추가 답글(왕복 스레드), 답변 만족도 평가.

### P2 (나중)

- FAQ/도움말 셀프서비스(문의 진입 상단 아코디언 디플렉션).

UX 화면: Figma 없음 → `/design`에서 컴포넌트 트리 설계(기존 폼·내역 화면 재활용 기반).

## 7. Data Model (확정)

```
inquiry
- id: PK (cuid)
- userId: FK(User) NOT NULL
- type: enum(ADOPTION, ACCOUNT, BUG, DONATION, SUGGESTION, APPEAL, ETC) NOT NULL
- content: text NOT NULL
- images: string[] NOT NULL default []
- status: enum(RECEIVED, IN_PROGRESS, DONE) NOT NULL default RECEIVED
- relatedReportId: FK(Report) NULL   # 이의제기 연결 — 채택 방식은 Open Issue
- createdAt: timestamptz NOT NULL default now()
- updatedAt: timestamptz NOT NULL @updatedAt
```

```
inquiry_reply
- id: PK (cuid)
- inquiryId: FK(inquiry) NOT NULL  (onDelete: Cascade)
- body: text NOT NULL
- createdAt: timestamptz NOT NULL default now()
```

관계: inquiry 1—N inquiry_reply (운영자 답변, MVP는 단방향이라 authorType 불필요 — 전부 운영자). user 삭제 시 inquiry 정책은 hard delete 정합(아래 영향 범위).

## 8. Backend Impact

### 마이그레이션

- Prisma 타임스탬프 마이그레이션(번호 아님). 현재 마지막: `20260617095338_add_user_nickname_updated_at`.
- 신규: `<timestamp>_add_inquiry` — `inquiry` + `inquiry_reply` 테이블 + enum(InquiryType, InquiryStatus) 추가.

### API / DTO

- 신규 모듈 `src/modules/inquiry/` (notice 모듈 구조 참조 — controller/service/dto/exception/converter).
- 엔드포인트:
  - `POST /inquiries` (사용자 제출)
  - `GET /inquiries/my` (내 문의 목록, 페이지네이션)
  - `GET /inquiries/:id` (상세 + 답변, 소유자 검증)
  - admin: `GET /admin/inquiries`, `POST /admin/inquiries/:id/replies`, `PATCH /admin/inquiries/:id/status`
- DTO: `CreateInquiryDto`, `InquiryListItem`, `InquiryDetail`, `CreateReplyDto`(admin).
- 알림 연동: 답변 생성 시 알림 시스템에 이벤트 발행(인터페이스만 정의, 실연동은 알림 시스템 진척에 맞춤).

### 영향 범위

- **hard delete 정합**: 회원 탈퇴 시 inquiry 처리(삭제 vs 익명화) — 신고/커뮤니티 정책과 동일 결로 spec에서 확정.
- **이의제기 가시성**: `00-notification-system.md` 통지 비대칭(게시자=사유+이의 / 신고자=결과만)과 답변 노출 정합.
- admin 인증·권한(운영자 식별) — admin 콘솔 인증 체계 의존.

## 9. Rollout Plan (Phase)

### Phase 0: 선행

- 백엔드 inquiry 모듈 + 마이그레이션. admin 답변 경로 골격. (push 없이도 인앱 상태/답변은 동작)
- 출시 신호: 사용자 제출→저장→admin 답변→문의내역 표시가 인앱에서 end-to-end 동작.

### Phase 1: MVP (이번 출시)

- FR-1~4, 6, 7 + FR-5(알림). push는 알림 시스템 진척에 맞춰 연결, 미가용 시 인앱 badge로 graceful.
- 출시 신호: 실제 문의 수신·답변, 재문의/악평 감소.

### Phase 2: 확장

- 사용자 추가 답글, FAQ 디플렉션.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정           | 옵션                                      | 채택                   | 사유                                                                                         |
| -------------- | ----------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------- |
| 회신 채널      | 이메일 전달 vs 인앱 단방향 vs 양방향 채팅 | 인앱 단방향            | 문의내역·답변 UI가 인앱에 있어 루프가 닫힘. 이메일 불필요(사용자 결정). 채팅은 1인 운영 불가 |
| 운영자 답변 수 | 1건 vs N건                                | N건                    | inquiry_reply 분리 테이블이 더 유연·단순. 추가 안내 가능                                     |
| FAQ 디플렉션   | 도입 vs 연기                              | 연기(P2)               | 받는 채널 먼저. 문의 패턴 축적 후 흡수(사용자 결정)                                          |
| 이의제기 채널  | 별도 vs 문의 통합                         | 문의 통합              | notification TBD 해소, 채널 단일화로 운영 단순                                               |
| 유형 구성      | 기존 6종 vs 재정비                        | 재정비(실종·목격 제외) | 실종·목격은 문의가 아니라 별도 기능(IA 정합)                                                 |

### Open Issues (→ /spec에서 확정)

- TBD — 이의제기 연결 방식: `type=APPEAL`만으로 둘지, `relatedReportId`로 신고 건과 FK 연결할지.
- TBD — 답변 가시성 정책: 이의제기 답변의 노출 범위가 notification 통지 비대칭과 정합되는지.
- TBD — 회원 탈퇴 시 inquiry 처리(hard delete vs 익명화 보존).
- TBD — admin 운영자 인증/권한 체계(admin 콘솔 공통 의존).

## 참고

- 백로그 원본: `docs/backlog/features/00-inquiry-support.md`
- 레퍼런스 BP: 당근/번개장터/포인핸드/Petfinder/Nextdoor/Zendesk (백로그 참조)
- 코드: `src/widgets/profile/ui/inquiry-form-scene.tsx`, `inquiry-history-scene.tsx`, `src/app/(untabs)/profile/inquiry/`
- 백엔드 참조 모듈: `keeper-backend/src/modules/notice/` (운영자→사용자 단방향 통지 패턴)
