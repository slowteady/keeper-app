# QA — 어드민 운영기능 보완 사이클

- 일자: 2026-06-23
- 대상: keeper-backend(로컬 미push) + keeper-admin. 운영설정 / 사용자 정지·권한 / 대시보드.
- 명세 문서: 없음(ad-hoc 구현) → 명세 정합 대신 위험 회귀 + 자동 테스트 + 라이브 시뮬 중심.
- 검증 방식: qa-auditor(위험·자동테스트) + 메인 직접 MCP 시뮬(playwright, 로컬 백엔드 :3000 새 코드 + 어드민 :5173).

## 자동 테스트

- keeper-backend `tsc`: 0
- keeper-backend `jest`: 245/245
- keeper-backend eslint(프로덕션 .ts): 0
- keeper-admin `tsc`: 0 / eslint: 0
- (참고) keeper-backend eslint 전체는 spec 파일 `no-unsafe-*` 23~25건 — 레포 spec 전반 기존 컨벤션, 프로덕션 코드 무관.

## 위험 회귀 점검 (qa-auditor)

| 항목                                                    | 결과                                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| JwtStrategy select에서 role 제거 → RolesGuard 영향      | ✅ RolesGuard가 자체 role DB조회(`roles.guard.ts`). 기존 어드민 라우트 회귀 없음 |
| 정지 강제 3지점(login/refresh/per-request)              | ✅ 모두 isSuspendedNow 적용                                                      |
| 마스터/본인 보호 (status·role 양쪽)                     | ✅ updateStatus·updateRole 모두 assertMutableTarget 선행                         |
| ACTIVE 복귀 시 suspendedUntil/suspendReason null 초기화 | ✅                                                                               |
| toAdminUser socialId 미노출 + isMaster 변환             | ✅                                                                               |
| dashboard $transaction 인덱스 매핑 / KST 자정           | ✅                                                                               |
| app-config partial PATCH / 싱글톤 없으면 생성           | ✅                                                                               |

## MCP 시뮬 (라이브 end-to-end)

마스터 id/pw 로그인(로컬 테스트용 `.env` creds 임시 추가) → 콘솔 진입 후:

| 흐름                                                                                                        | 결과 |
| ----------------------------------------------------------------------------------------------------------- | ---- |
| 대시보드 랜딩 + 라이브 stats(미처리 문의 6 = API와 일치)                                                    | ✅   |
| 사용자 목록 10명, 마스터 행 액션 '—'(보호), ADMIN '관리자 해제'·USER '정지/관리자'                          | ✅   |
| 정지: 다이얼로그(기간·사유) → PATCH → DB SUSPENDED → refetch → '정지/영구'+'해제' 전환                      | ✅   |
| 정지 강제: devLogin으로 토큰 발급돼도 `/users/me` → 403 `USER_SUSPENDED` + `details{reason,suspendedUntil}` | ✅   |
| 해제: → DB ACTIVE 복원                                                                                      | ✅   |
| 운영설정 폼 라이브 렌더(점검·iOS/Android 버전·스토어URL·저장)                                               | ✅   |

## 발견 사항

### P0 (수정 완료)

- **사이드바 내비에 신규 메뉴 누락** — `app-layout.tsx`의 `NAV`가 하드코딩(문의/공지/신고)이라 대시보드·사용자·운영설정이 사이드바에 없고 URL로만 접근 가능했음. P0 운영설정(앞선 작업)에서도 누락돼 있던 갭. → `NAV`에 대시보드·사용자·운영설정 추가. 시뮬로 6개 메뉴 노출 재확인. **자동 테스트로는 안 잡히고 시뮬에서 발견.**

### P1

- **UserList 클라 사이드 `pageSize=100` 하드코딩** (`keeper-admin/src/pages/users/index.tsx`) — 사용자 101명 이상 시 검색/목록 누락. 기존 inquiries/reports 컨벤션과 동일하나 사용자는 전체 유저라 규모 우려. 백엔드가 `search`+페이지네이션 지원하므로 server-side 전환 권장. → **결정 대기**.
- **devLogin 정지 미체크** — auditor가 service만 보고 제기. 단 `auth.controller.ts:72`가 `NODE_ENV !== local/development`면 차단(운영 비활성)이고, 토큰 발급돼도 매-요청 가드가 USER_SUSPENDED로 차단(라이브 확인). → **실위험 없음(해소)**.
- **spec eslint debt** — 레포 spec 전반 `no-unsafe-*`. 신규 spec도 동일 패턴. 프로덕션 0. → 레포 norm, 후속 일괄.

### P2

- **app-config DEFAULTS storeUrl 빈 문자열** (`app-config.service.ts`) — `iosStoreUrl/androidStoreUrl: ''`. 강제 업데이트 시 스토어 링크 없음. 실제 URL 채우거나 nullable 처리 권장.
- **dashboard KST 경계 단위테스트 없음** — 로직 정확, 회귀 방어용 테스트만 미비.

## 잔여 (범위 밖)

- 앱 측 `USER_SUSPENDED` 소비(keeper-app 인터셉터 → 정지 안내 화면 + 강제 로그아웃) 미구현. 백엔드 details 페이로드는 라이브 확인 완료.
- 마이그레이션 `20260623020424_add_user_status`: 로컬 DB 적용 완료, prod는 develop push 시 preDeploy 자동.

## QA 판정

P0 1건 수정 완료(재검증 통과). 잔존 P0 없음. P1 1건(클라 페이지네이션) 결정 대기, 나머지 해소/후속. **통과.**
