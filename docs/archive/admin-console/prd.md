# PRD: 운영 콘솔 (Admin Console)

## 1. 메타

- 작성일: 2026-06-19
- 상태: 초안
- 입력 백로그: docs/backlog/admin-console.md (2026-06-19 P0 승격 정착본)
- 관련 PRD: [[inquiry-support]] (첫 슬라이스 대상), 의존 [[00-notification-system]] (운영자 push)
- 코드베이스: 신규 별도 레포 `keeper-admin` (react-admin SPA). keeper-app FSD 범위 밖.

## 2. Problem / Why

- keeper는 1인·소수 운영. UGC(커뮤니티·개인입양 공고·댓글·1:1 문의)를 받는 순간 운영자 처리 수단이 필요한데, **운영자가 쓸 화면이 0**이다.
- 특히 **문의(inquiry)는 백엔드 admin API 3개(목록·답변·상태변경)가 이미 구현**됐는데도 운영자가 답변을 넣을 UI가 없어 **피드백 루프가 안 닫힌다** — 사용자는 문의를 보내도 답을 못 받는다(=출시 시 "보냈는데 답 없는" 유령 경험, [[inquiry-support]] FR-6 미완).
- 신고·모더레이션·운영플래그·공지·유저는 DB 스키마만 있고 admin API·화면이 전부 비어 있어, 운영자는 Prisma Studio/SQL로 직접 DB를 만지는 수밖에 없다(비개발자 협력자는 불가능).
- 시그널: inquiry 기능 QA에서 "운영자 답변 입력 경로 없음"이 end-to-end 미완으로 도출. admin-console 백로그(2026-06-04)의 미결(웹 스택·인증)이 RBAC 도입으로 해소되며 착수 가능해짐.

## 3. Goals / Non-Goals

### Goals

- 운영자(오너 + 신뢰하는 비개발자 협력자)가 **웹 콘솔에서 문의를 보고 답하고 상태를 바꿀 수 있다** → 문의 피드백 루프를 닫는다.
- 운영자가 **Prisma Studio/SQL 없이** 일상 운영(문의 답변)을 처리한다.
- **재사용 가능한 셸**(인증·레이아웃·RBAC 연동·공통 컴포넌트)을 한 번 세워, 이후 신고·공지 등 슬라이스를 같은 셸 위에 점진 추가할 수 있다.

### Non-Goals

- **신고 처리·콘텐츠 모더레이션** — 이번엔 안 함. 법적 필수지만 admin API 미구현이라 부피 큼 → 출시 구간은 Prisma Studio/SQL stopgap, 후속 슬라이스로. (백로그 §5 후속)
- **운영 플래그 GUI(app_config)·공지 CRUD·유저 관리·통계** — 이번 안 함. Prisma Studio로 충분하거나 후순위.
- **MODERATOR 중간 권한 등급** — 안 함. 권한은 ADMIN 단일(관리자거나 접속 불가). 위험 조작 제한 필요가 생기면 그때 재도입.
- **admin 전용 이메일+비번 인증** — 안 함. keeper는 소셜 전용이라 비번 시스템 신설은 과함 → 기존 카카오 OAuth 재사용.
- **앱 내 운영자 화면(모바일에서 답변)** — 안 함. 조작은 웹. 데이터 무거운 후속 운영(신고 목록·통계)에 모바일 부적합.
- **운영자 push 알림 자체 구현** — 안 함. [[00-notification-system]] 트랙에 의존. 답변 기능은 알림 없이도 동작.

## 4. Success Metrics

- 정량: 문의 답변 완료율(완료 처리된 문의 비율), 평균 첫 응답 시간, 운영자가 DB 도구를 거치지 않고 처리한 문의 비율(목표 100%).
- 정성: "보냈는데 답이 없다"류 재문의·악평 소멸([[inquiry-support]]와 공유 지표), 비개발자 협력자가 별도 교육 없이 답변 가능.

## 5. User Scenarios

### 페르소나

- **오너(본인)**: 전권 운영자. 협력자에게 권한을 부여하고, 모든 운영을 처리.
- **협력자(비개발자)**: 오너가 ADMIN으로 승격한 신뢰 멤버. 주로 문의 답변을 담당.

### 시나리오 (Given-When-Then)

- Given 오너가 협력자의 카카오 계정에 `role = ADMIN`을 부여, When 협력자가 admin 웹에서 "카카오로 로그인", Then 콘솔에 접근해 문의 목록을 본다.
- Given role이 USER인(또는 미승격) 사람이 admin 웹 접속, Then 로그인은 되더라도 보호 라우트·서버 가드에서 차단돼 콘솔을 못 본다(접속 불가).
- Given 운영자가 문의 목록에서 "접수" 상태 문의를 선택, When 답변을 작성해 등록, Then 답변이 저장되고 상태가 완료로 전이되며, 사용자 앱 문의내역에서 답변이 보인다.
- Given 운영자가 문의를 검토 중, When 상태를 "처리중"으로 변경, Then 사용자 문의내역의 상태 뱃지가 갱신된다.
- (알림 시스템 연동 후) Given 새 문의 접수, Then 운영자의 keeper 앱으로 push가 오고, 탭하면 admin 웹으로 연결된다.

## 6. Functional Requirements

### P0 (이번 출시 — 셸 + 문의 답변 슬라이스)

- **FR-1. 운영자 인증(카카오 웹 OAuth)** — As 운영자, 카카오로 admin 웹에 로그인하고 싶다.
  - AC: admin 웹에서 "카카오로 로그인" → 기존 keeper JWT 발급 → 콘솔 진입.
  - AC: 로그인 사용자의 `role`이 `ADMIN`이 아니면 콘솔 접근 불가(보호 라우트 + 서버 가드 이중).
  - AC: 로그아웃 가능. 토큰 만료 시 재로그인 유도.
- **FR-2. 콘솔 셸** — As 운영자, 일관된 레이아웃에서 메뉴를 오가고 싶다.
  - AC: react-admin 기본 레이아웃(사이드바·앱바), 반응형(모바일에서 드로어, 목록은 `useMediaQuery`로 `SimpleList` 전환).
  - AC: 보호 라우트 — 비인증/비ADMIN은 로그인 화면으로.
  - AC: 후속 슬라이스(신고·공지 등)를 resource 추가만으로 얹을 수 있는 구조.
- **FR-3. 문의 목록** — As 운영자, 들어온 문의를 한눈에 보고 싶다.
  - AC: `GET /admin/inquiries` 연동, 최신순, 페이지네이션.
  - AC: 상태(접수/처리중/완료)·유형 필터, 각 행에 유형·상태·작성시각·요약.
- **FR-4. 문의 상세** — As 운영자, 문의 원문과 기존 답변을 보고 싶다.
  - AC: 원문(유형·내용·첨부 이미지) + 기존 운영자 답변(N건) 표시.
- **FR-5. 답변 작성** — As 운영자, 문의에 답하고 싶다.
  - AC: `POST /admin/inquiries/:id/replies`로 답변 저장. 저장 시 상태가 완료로 자동 전이(기존 백엔드 동작).
- **FR-6. 상태 변경** — As 운영자, 진행 상태를 바꾸고 싶다.
  - AC: `PATCH /admin/inquiries/:id/status`로 접수↔처리중↔완료 전이(전이맵 검증은 기존 백엔드).

### P1 (다음 슬라이스)

- 신고 처리(목록·HIDE/DELETE/BAN·양 당사자 통지), 운영 플래그 GUI(app_config), 공지 CRUD, 유저 관리(role 부여 GUI), **운영자 push 연동**([[00-notification-system]]).

### P2 (나중)

- 통계 대시보드(가입·공고·신고·문의 수), 입양 후기 큐레이션.

UX 화면: Figma 없음 → `/design`에서 react-admin 컴포넌트 매핑으로 설계.

## 7. Data Model (확정)

- **신규 테이블 없음.** 기존 자산 재사용:
  - `inquiry` / `inquiry_reply` — 문의·답변(완비).
  - `User.role`(`UserRole USER/ADMIN`) — 운영자 식별(완비).
- admin 웹앱은 별도 레포의 **프론트 전용**이며 자체 DB 없음. 모든 데이터는 keeper-backend REST로 접근.
- ADMIN 권한 부여 = 초기엔 오너가 DB에서 `role = ADMIN` 직접 변경(운영자 소수). GUI화는 후속(유저 관리 슬라이스).

## 8. Backend Impact

### 마이그레이션

- **신규 마이그레이션 없음 예상.** `User.role`·`inquiry`·`inquiry_reply` 모두 기존 마이그레이션(20260618 add_user_role·add_inquiry)으로 존재.

### API / DTO

- **신규(이번 P0에 필요)**: 웹 카카오 OAuth 로그인 경로.
  - 현재 소셜 로그인은 모바일(네이티브 SDK 토큰 교환) 기준 → **웹 인가코드 콜백 흐름**이 추가로 필요. 방식(기존 카카오 앱에 웹 플랫폼 추가 + 콜백 엔드포인트 신설 vs SPA가 카카오 JS SDK로 토큰 취득 후 기존 로그인 엔드포인트 호출)은 **/spec에서 확정**.
  - **CORS**: admin 웹 origin(별도 도메인)을 백엔드 CORS allowlist에 추가.
- **재사용(변경 없음)**: 기존 inquiry admin API 3개(`GET /admin/inquiries`, `POST /admin/inquiries/:id/replies`, `PATCH /admin/inquiries/:id/status`, 모두 `@Roles(ADMIN)` + `RolesGuard`).
- 변경 가능 영역: 목록 필터/페이지네이션 파라미터가 react-admin `dataProvider` 규약과 맞는지 점검(/spec).

### 영향 범위

- 인증 경계: 웹 OAuth 추가가 기존 모바일 로그인 흐름을 깨지 않아야 함(별도 경로/플랫폼).
- 보안: 보호 라우트는 UX 차단선일 뿐, 실제 데이터는 반드시 서버 `RolesGuard`가 JWT+role 재검증(클라 신뢰 금지).
- hard delete/마스킹 등 도메인 정책 변경 없음(조회·답변·상태변경만).

## 9. Rollout Plan (Phase)

### Phase 0: 선행

- `keeper-admin` 레포 부트스트랩(Vite + react-admin) + Vercel 배포 골격.
- 웹 카카오 OAuth 로그인 + role 가드(셸).
- 오너 계정 `role = ADMIN` 부여(수동).
- 출시 신호: 운영자가 카카오로 로그인해 빈 콘솔에 진입, 비ADMIN은 차단됨.

### Phase 1: MVP (이번 출시)

- 문의 목록·상세·답변·상태변경(FR-3~6).
- 출시 신호: 사용자 제출 → 운영자 웹 답변 → 사용자 앱 문의내역에 답변 표시가 end-to-end 동작(=inquiry 루프 닫힘).
- 알림 미연동 구간: 운영자가 주기적으로 콘솔을 확인(graceful). 알림 시스템 완성 시 push 연동.

### Phase 2: 확장

- 신고 처리 → 운영 플래그 GUI → 공지·유저 관리 → 통계. 각 슬라이스는 셸 위에 resource 추가.

## 10. ADR (Decision Log) + Open Issues

### 결정 기록

| 결정           | 옵션                                                        | 채택             | 사유                                                                                                      |
| -------------- | ----------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------- |
| 이번 P0 스코프 | 신고+문의 vs 운영 풀세트 vs 문의만                          | 문의만(+셸)      | 신고는 API 미구현이라 부피 큼. 문의는 API 완비 → 셸만 세우면 즉시 루프 닫힘. 신고는 DB 도구 stopgap       |
| 조작 채널      | 앱 내 화면 vs 별도 웹                                       | 별도 웹          | 데이터 무거운 후속 운영(신고·통계)에 모바일 부적합. 인지는 앱 push로 분리                                 |
| 스택           | react-admin vs Refine+shadcn vs 자체 Next.js vs Retool      | react-admin      | 속도 우선 — dataProvider+authProvider+resource로 화면 자동 생성. MUI 룩은 내부툴이라 감수, 확장 시 재검토 |
| 인증           | 웹 카카오 OAuth vs 이메일+비번 vs Google/Apple              | 웹 카카오 OAuth  | 소셜 전용이라 비번 시스템 신설 과함. "유저 승격" 모델과 일관. KR 운영자엔 카카오 보편(Apple 웹 번거로움)  |
| 권한 등급      | ADMIN 단일 vs MODERATOR 추가                                | ADMIN 단일       | 신뢰하는 소수만 들임 → 등급 분리 불필요(관리자거나 접속 불가). 단순함 우선                                |
| 빌드 순서      | 한 번에 전부 vs 셸 먼저+점진                                | 셸 먼저+점진     | 셸(인증·레이아웃)은 고정비용 한 번, 기능 화면은 슬라이스로. "API만 있고 UI 없는" 사각 방지                |
| 레포·배포      | 별도 `keeper-admin`+Vercel vs 백엔드 모노레포 vs keeper-web | 별도 레포+Vercel | keeper 기존 레포 분리 구조와 일관. react-admin은 독립 SPA. dev 분리 X(Vercel preview=dev)                 |

### Open Issues (→ /spec에서 확정)

- TBD — 웹 카카오 OAuth 구체 방식: 기존 카카오 앱에 웹 플랫폼·redirect URI 추가 + 백엔드 콜백 엔드포인트 신설 vs SPA가 카카오 JS SDK로 토큰 취득 후 기존 로그인 엔드포인트 재사용. 백엔드 CORS allowlist 포함.
- TBD — admin 도메인(예: `admin.our-keeper.com` vs Vercel 기본 도메인) + 카카오 redirect URI 등록값.
- TBD — react-admin `dataProvider`가 기대하는 목록 응답 규약(총 개수·정렬·필터 파라미터)과 기존 `GET /admin/inquiries` 응답(PageV2)의 매핑.

## 참고

- 백로그 원본: `docs/backlog/admin-console.md`
- 관련 PRD: `docs/prd/inquiry-support.md`
- 레퍼런스 BP: [react-admin](https://marmelab.com/react-admin/) · [react-admin 반응형(useMediaQuery)](https://github.com/marmelab/react-admin/blob/master/docs/useMediaQuery.md) · 인증/RBAC BP(NestJS RolesGuard, 서버 role 재검증)
- 백엔드 참조: `keeper-backend/src/modules/inquiry/` (admin API), `src/common/guard/roles.guard.ts`
