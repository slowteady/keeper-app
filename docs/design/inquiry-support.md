# Design: 문의하기(고객지원/CS) 재설계

## 1. 메타

- 작성일: 2026-06-18
- 상태: 리뷰
- 입력 PRD: docs/prd/inquiry-support.md
- Figma URL: 없음 — 컴포넌트 조립 기반(Case B)

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명               | 진입 경로                  | 다음 화면    |
| ------- | -------------------- | -------------------------- | ------------ |
| S1      | 문의 컨테이너(탭)    | 프로필 → 문의하기          | S2/S3        |
| S2      | 문의 작성 폼         | S1 "문의하기" 탭           | 제출 → S3    |
| S3      | 문의내역 리스트      | S1 "문의내역" 탭           | 항목 탭 → S4 |
| S4      | 문의 상세(원문+답변) | S3 항목 / 답변 push 딥링크 | —            |

흐름:

```
프로필 메뉴(문의하기, requireAuth)
  └─ S1 탭 컨테이너
       ├─ [문의하기] S2 폼 ──제출──▶ S3 로 전환(+토스트)
       └─ [문의내역] S3 리스트 ──항목 탭──▶ S4 상세
                                  ▲
                  답변 push ──딥링크(알림 시스템 의존)──┘
```

## 3. 컴포넌트 매핑

### S1: 문의 컨테이너(탭) — 변경 최소

컴포넌트 트리:

```
Page (app/(untabs)/profile/inquiry/index.tsx)
└── Tab (문의하기 / 문의내역)
     ├── InquiryFormScene      → S2
     └── InquiryHistoryScene   → S3
```

| 컴포넌트       | 출처                     | 용도            | 재활용 |
| -------------- | ------------------------ | --------------- | ------ |
| Tab            | shared/ui (data-display) | 2탭 스위치      | 재활용 |
| NavigateHeader | shared/ui (layout)       | 상단 "문의하기" | 재활용 |

### S2: 문의 작성 폼 — 기존 정비

컴포넌트 트리:

```
InquiryFormScene (FormLayout)
├── Title "어떤 유형의 문의인가요?"
├── ButtonGroup ×2줄  (유형 7종 칩 그리드)
├── SectionLabel + Counter
├── TextArea (내용)
├── CaptionLabel + ImageSelector (최대 10)
└── footer: BottomButton "등록하기" → useCreateInquiry
```

| 컴포넌트         | 출처               | 용도                      | 재활용                 |
| ---------------- | ------------------ | ------------------------- | ---------------------- |
| FormLayout       | shared/ui (layout) | 스크롤 폼 + sticky footer | 재활용                 |
| ButtonGroup      | shared/ui (button) | 유형 선택 칩              | 재활용 (데이터 재정비) |
| TextArea         | shared/ui (form)   | 본문                      | 재활용                 |
| ImageSelector    | shared/ui (form)   | 이미지 첨부               | 재활용                 |
| BottomButton     | shared/ui (button) | 제출                      | 재활용                 |
| useCreateInquiry | features/inquiry   | 제출 mutation             | 신규                   |

정비 내용: 유형 `입양/계정·로그인/오류·버그/후원/제안/이의제기/기타`(실종·목격 제거). `handleSubmit` TODO → `useCreateInquiry` 실연동(R2 presign 업로드는 ImageSelector/upload 재사용). 성공 시 문의내역 탭 전환 + 토스트.

### S3: 문의내역 리스트 — 빈 스텁 → 실데이터

컴포넌트 트리:

```
InquiryHistoryScene
└── FlashList (useMyInquiries)
     ├── InquiryListItem  (신규)
     │    ├── InquiryStatusBadge (신규)  접수/처리중/완료
     │    ├── 유형 라벨 + 작성시각
     │    └── 내용 요약 (1~2줄)
     └── ListEmptyComponent: ProfileEmptyState ("문의 내역이 없어요")
```

| 컴포넌트           | 출처                            | 용도          | 재활용 |
| ------------------ | ------------------------------- | ------------- | ------ |
| FlashList          | 라이브러리(@shopify/flash-list) | 리스트        | 재활용 |
| InquiryListItem    | entities/inquiry/ui             | 내역 행       | 신규   |
| InquiryStatusBadge | entities/inquiry/ui             | 상태 3톤 뱃지 | 신규   |
| ProfileEmptyState  | widgets/profile/ui              | 빈 상태       | 재활용 |
| useMyInquiries     | features/inquiry                | 목록 query    | 신규   |

### S4: 문의 상세 — 신규 화면

컴포넌트 트리:

```
Page (app/(untabs)/profile/inquiry/[id].tsx)
└── InquiryDetailScene (useInquiryDetail)
     ├── NavigateHeader "문의 상세"
     ├── 내 문의 카드
     │    ├── 유형 칩 + InquiryStatusBadge + 작성시각
     │    ├── 본문
     │    └── 첨부 이미지 썸네일 → ImageViewer
     ├── Divider + 라벨 "운영자 답변"
     └── 답변 영역
          ├── InquiryReplyCard ×N  (배경색 구분 카드, 작성시각)
          └── 답변 없으면 안내 ("답변을 준비하고 있어요")
```

| 컴포넌트           | 출처                | 용도             | 재활용            |
| ------------------ | ------------------- | ---------------- | ----------------- |
| NavigateHeader     | shared/ui (layout)  | 헤더             | 재활용            |
| ImageViewer        | shared/ui (overlay) | 첨부 확대        | 재활용            |
| InquiryDetailScene | widgets/profile/ui  | 상세 조립        | 신규              |
| InquiryReplyCard   | entities/inquiry/ui | 운영자 답변 카드 | 신규              |
| InquiryStatusBadge | entities/inquiry/ui | 상태 뱃지        | 재활용(S3 신규분) |
| useInquiryDetail   | features/inquiry    | 상세 query       | 신규              |

### 신규 컴포넌트 사유

- **InquiryStatusBadge**: 기존 상태칩은 `community-post-list-item`/`adopt-card`에 **인라인 2톤(notice/success)**만 존재. 문의는 **3톤(접수=중립/처리중=notice/완료=success)** 필요하고 도메인 의미가 달라 재활용 불가. entities/inquiry 전용으로 신설(패턴 반복되면 shared 승격 — 지금은 YAGNI).
- **InquiryListItem**: 기존 list item(`CommunityPostListItem` 등)은 커뮤니티 게시글 데이터(좋아요·썸네일·카테고리) 모양이라 문의(상태+유형+요약) 형태와 불일치.
- **InquiryReplyCard / InquiryDetailScene**: 문의 상세 화면 자체가 부재. 단방향 카드 스택 레이아웃은 기존 컴포넌트 없음.

## 4. FSD 프론트 슬라이스 매핑

| 컴포넌트                                                                  | 슬라이스               | 파일 경로                                        |
| ------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------ |
| inquiry 스키마/타입                                                       | entities/inquiry       | src/entities/inquiry/schema.ts                   |
| inquiry api/queries                                                       | entities/inquiry       | src/entities/inquiry/api.ts                      |
| InquiryStatusBadge                                                        | entities/inquiry/ui    | src/entities/inquiry/ui/inquiry-status-badge.tsx |
| InquiryListItem                                                           | entities/inquiry/ui    | src/entities/inquiry/ui/inquiry-list-item.tsx    |
| InquiryReplyCard                                                          | entities/inquiry/ui    | src/entities/inquiry/ui/inquiry-reply-card.tsx   |
| useCreateInquiry/useMyInquiries/useInquiryDetail                          | features/inquiry/model | src/features/inquiry/model/                      |
| InquiryFormScene(정비)/InquiryHistoryScene(정비)/InquiryDetailScene(신규) | widgets/profile/ui     | src/widgets/profile/ui/                          |
| 상세 라우트                                                               | app                    | src/app/(untabs)/profile/inquiry/[id].tsx        |

## 5. 의존성

- 라이브러리 추가: 없음 (전부 기존 자산).
- 다른 슬라이스 변경: `constants.ts` 메뉴(문의하기 `requireAuth` 유지, 변경 없음). 신규 `entities/inquiry`·`features/inquiry` 슬라이스.
- 선행 작업: 백엔드 inquiry 모듈(`/spec`·`/be`). push 딥링크는 알림 시스템 의존 — 미가용 시 S3→S4 수동 진입 + 인앱 미읽음 badge로 graceful(PRD FR-5).

## 6. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                                              | 채택                         | 사유                                                                                                            |
| ---------------- | ------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 유형 선택 컨트롤 | 드롭다운/바텀시트(BP 6+) vs ButtonGroup 칩 그리드 | ButtonGroup 칩 그리드        | 유형은 폼 첫 결정이라 한눈 노출이 탐색에 유리. keeper 기존 폼(개인입양·QnA) 칩 톤과 일관. 7종은 2줄로 수용 가능 |
| 상세 레이아웃    | 채팅 말풍선(좌우) vs 카드 스택(상하)              | 카드 스택 + 배경색 구분      | 단방향 비동기 문의에 말풍선은 과잉(NN/G). 원문↑·답변↓ 스택이 직관적                                             |
| 상태 뱃지 위치   | entities/inquiry vs shared 공용                   | entities/inquiry/ui          | 현재 소비처 1곳. 신고/공지 등 반복되면 shared 승격(YAGNI)                                                       |
| 진입 동선        | 목록 경유 vs push 딥링크 직행                     | 딥링크 직행(+목록 경유 병행) | BP 표준. 단 알림 시스템 의존 → MVP는 목록 경유 보장                                                             |

### Open Issues

- TBD — 첨부 이미지 다중 시 상세 카드 내 썸네일 그리드 vs 가로 스크롤 (스펙/구현 시 미세 결정).
- TBD(→/spec) — 이의제기 문의의 답변 가시성(통지 비대칭 정합), relatedReportId 연결 방식.

## 참고

- PRD: `docs/prd/inquiry-support.md`
- 백로그: `docs/backlog/features/00-inquiry-support.md`
- 외부 UI BP: 당근/카카오/번개장터/토스/Intercom/Zendesk/Rover/Nextdoor + NN/G Chat UX, Smart Interface(badges vs chips), Dropdown alternatives
- 코드: `src/widgets/profile/ui/inquiry-{form,history}-scene.tsx`, `src/app/(untabs)/profile/inquiry/`
