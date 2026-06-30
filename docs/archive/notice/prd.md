# PRD: 공지사항 (notice)

> 입력: `docs/backlog/notice.md`(확정, 5개 BP 결정 완료).
> 멀티 레포: keeper-app(본문) · keeper-backend(마이그레이션·admin API) · keeper-admin(작성 화면). 후자 둘은 FSD 밖, 영향만.

## 1. Problem / Why

운영자가 사용자에게 소식·정책 변경·긴급 안내(서비스 장애 등)를 전달할 채널이 없다. 백엔드 `Notice` 읽기 API는 있으나 프론트 연동·일반/긴급 구분·이미지·노출 경로가 전무해, 공지를 띄울 방법 자체가 없는 상태다. 비영리·1인 운영이라 전달은 **절제**돼야 하고(남발 시 신뢰 저하), 동시에 긴급 안내는 확실히 닿아야 한다.

## 2. Goals

- 운영자가 **일반/긴급** 공지를 이미지와 함께 발행할 수 있다.
- 사용자는 **일반 공지를 홈에서** 인지하고 상세로 진입한다.
- **긴급 공지는 앱 진입 시 즉시(하프시트)** 확인하되, 반복 노출로 피로하지 않다.
- 공지 이력은 **프로필 공지사항 리스트**에서 다시 볼 수 있다.

## 3. Non-Goals (이번에 안 함)

- **전면 모달(긴급)** — 점검·강제업데이트 게이트와 위계 충돌. 하프시트로(비차단).
- **push 알림** — 알림 인프라 폐기 + "앱 진입 즉시"는 인앱이 정답. 인앱 모달 독립.
- **핀 고정** — 1인 운영·초기 공지량 적음, 긴급은 이미 모달 처리. YAGNI.
- **"오늘 하루 안 보기"** — 반복 프로모션용. 긴급은 1회 확인이 BP.
- **읽음 서버 동기화** — 로컬 ID 배열로 충분.
- **홈 이미지 배너 통합** — 홍보 캐러셀과 텍스트 공지 성격 달라 별도 카드.

## 4. Functional Requirements

### P0 — keeper-app

- **FR1 일반/긴급 구분**: 공지에 `type`(NORMAL/URGENT) 표시. 리스트·카드에 type 뱃지.
- **FR2 이미지 표시**: 상세에서 다중 이미지 스크롤 스트립 + 탭 시 전체화면 뷰어(`Carousel`/`ImageViewer` 재활용).
- **FR3 홈 일반공지 진입점**: 홈에 공지 전용 카드(제목+날짜+type 뱃지), 기존 이미지 배너와 별도. 클릭 → `/profile/notice/[id]`.
- **FR4 프로필 공지 리스트**: `ProfileNoticeScene`(빈 껍데기) → `GET /notices` 연동. 최신순. 읽음=dimmed(로컬 ID 배열). type 뱃지. 빈/로딩/에러 분기.
- **FR5 공지 상세**: `/(untabs)/profile/notice/[id]` 신규 — 제목·날짜·type·본문·이미지. 진입 시 로컬 읽음 기록.
- **FR6 긴급공지 앱진입 노티**: `useAppGate` 단일 큐에 긴급공지 분기 추가 — **점검/강제업데이트 우선 → 긴급공지 후순위**(동시 노출 금지, 직렬). **하프시트**로 제목·본문·이미지 표시. "다시 안 보기" 버튼.
- **FR7 긴급 재노출 정책**: `noticeId + dismissedAt`을 AsyncStorage에 저장. 같은 공지는 dismiss 후 재노출 안 함. **새 긴급공지(다른 id)는 재노출**.

### P0 — keeper-backend / keeper-admin (별도 레포)

- **FR8 마이그레이션**: `Notice`에 `type`(enum)·`images`(String[])·노출제어 필드(활성/만료 — spec 확정) 추가.
- **FR9 admin CRUD**: `POST/PATCH/DELETE /admin/notices`(@Roles ADMIN), 이미지 R2 presign.
- **FR10 긴급 조회 경로**: `/bootstrap` 응답에 활성 긴급공지 포함 vs 별도 `GET /notices?type=URGENT&active` — spec에서 확정.

## 5. User Scenarios

- **일반 사용자(홈)**: 홈 공지 카드 → 탭 → 프로필 공지 상세에서 본문·이미지 확인.
- **일반 사용자(앱 진입)**: 긴급공지 있으면(점검/강제업뎃 없을 때) 하프시트 노출 → 확인/"다시 안 보기" → 같은 공지 재노출 X.
- **사용자(이력)**: 프로필 > 공지사항 → 리스트(읽음 dimmed) → 상세.
- **운영자**: keeper-admin에서 공지 작성(일반/긴급, 이미지) → 발행.

## 6. Backend Impact (keeper-backend, 별도 레포)

- **마이그레이션**: `Notice` ALTER — `type NoticeType`(NORMAL/URGENT, default NORMAL), `images String[]`, 노출제어(`isActive`/`expiresAt` 등 spec 확정). Prisma migrate(timestamp 자동).
- **API**: 기존 `GET /notices`(목록, type 뱃지용 type 포함)·`/notices/:id`(상세, images 포함) 응답 확장. 신규 admin `POST/PATCH/DELETE /admin/notices`(@Roles ADMIN). 긴급 조회 경로(FR10).
- **DTO/zod 3중 검증**: type enum·images 배열 — keeper-app zod ↔ backend DTO ↔ DB.

## 7. Rollout

- 순서: **backend 마이그레이션 + API → keeper-app 연동 → keeper-admin 작성 화면**. 공지 데이터 없으면 app은 빈 상태로 안전 동작.
- 긴급공지 조회 경로(bootstrap 통합 vs 별도) 확정이 app의 appGate 연동 선행.
- 네이티브 재빌드 불필요(전부 JS/API). admin은 별도 배포.

## 8. ADR

- **긴급=하프시트(전면 X)**: 점검/강제업뎃 전면 게이트와 위계 분리, 절제(NN-g/토스).
- **인앱 독립(push X)**: 알림 인프라 폐기 + 앱진입 즉시=인앱. push 의존 회피.
- **"다시 안 보기"(영구, 공지별)**: 매 진입 강제는 습관화 역효과(Smashing). 새 공지만 재노출.
- **핀 컷**: 1인 운영·긴급은 모달 처리. YAGNI.
- **읽음 로컬**: 서버 동기 과함(1인 운영). AsyncStorage ID 배열.
- **홈 별도 카드**: 이미지 배너(홍보)와 공지(텍스트) 성격 분리, 집중도.

## 9. Open Issues (→ /spec)

- 긴급공지 조회 경로: `/bootstrap` 통합 vs 별도 endpoint (appGate 1회 조회 효율 vs 분리)
- 노출제어 필드 설계: `isActive`만 vs `expiresAt`(만료 자동) 포함
- 다수 긴급공지 동시 활성 시 노출 순서(최신 1건만? 직렬 큐?)
- 읽음 로컬 저장 키 구조(AsyncStorage), dismiss 저장과 분리 여부
- `images` 타입: String[] vs Json (R2 URL 배열)

## 10. Success

- 운영자가 공지 발행 → 사용자 홈/프로필 노출, 긴급은 앱진입 1회 확인. (전달률·재노출 피로는 정성 확인, 측정 후속)
