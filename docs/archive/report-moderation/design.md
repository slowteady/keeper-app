# Design: 신고 처리 (운영자 모더레이션)

## 1. 메타

- 작성일: 2026-06-19
- 상태: 초안
- 입력 PRD: docs/prd/report-moderation.md
- Figma: 없음 — keeper-admin(Refine + shadcn/ui) 기존 문의 슬라이스 패턴 재활용
- 코드베이스: 별도 레포 keeper-admin (Refine 헤드리스 + shadcn, Tailwind v4, keeper그린). keeper-app FSD 아님.

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명           | 진입            | 다음                          |
| ------- | ---------------- | --------------- | ----------------------------- |
| S1      | 신고 큐(목록)    | 사이드바 "신고" | 행 클릭 → S2                  |
| S2      | 신고 상세 + 처리 | S1 행 클릭      | 블라인드/삭제/기각 후 S1 갱신 |

```
사이드바[문의 | 신고] → /reports (큐) → 행 클릭 → /reports/:type::id (상세)
   → [블라인드 | 삭제(확인) | 기각] → handle → 목록 갱신
```

Refine resource `reports` 추가. **복합 id** = `${type}:${id}` (POST/COMMENT 2종을 한 큐에 → Refine record id로 합성, dataProvider에서 분해).

## 3. 컴포넌트 매핑

> 출처: **shadcn**(src/components/ui/\*, 기존) / **Refine**(@refinedev/core 훅) / **신규**(keeper-admin 커스텀).

### S1: 신고 큐 (pages/reports/list.tsx)

컴포넌트 트리:

```
페이지 헤더(제목 "신고" + 설명)
툴바: [상태 Select(미처리/완료/전체)]
Card > Table
  헤더: 대상 | 사유 | 신고수 | 최신 신고 | 상태
  행: ContentTypeBadge(글/댓글) · 콘텐츠 미리보기 · ReportReasonBadge(대표) · 신고수 · DateField · 처리상태 Badge
  → rowClick → /reports/:type::id
페이지네이션(총건수·이전/다음)  ← 문의 list 패턴 재활용
```

| 컴포넌트                          | 출처         | 비고                                                                      |
| --------------------------------- | ------------ | ------------------------------------------------------------------------- |
| `useList`                         | Refine       | `reports` 리소스 집계 큐                                                  |
| Table/Card/Select/Skeleton/Button | shadcn       | 재활용(문의 list)                                                         |
| ContentTypeBadge                  | 신규         | 글/댓글 구분 칩                                                           |
| ReportReasonBadge                 | 신규         | reason 7종(SPAM/ABUSE/FRAUD/ANIMAL_ABUSE/PRIVACY/MONETARY/MISUSE) 한글 칩 |
| 처리상태 Badge                    | shadcn Badge | 미처리(notice)/완료(muted)                                                |

### S2: 신고 상세 + 처리 (pages/reports/show.tsx)

컴포넌트 트리:

```
헤더(← 뒤로 + "신고 상세")
원문 카드: ContentTypeBadge + 작성자 + isHidden 상태 + 원문 내용(+이미지)
신고 목록 카드: 신고 N건 — 각 ReportReasonBadge + reasonDetail + 신고시각
처리 액션 바: [블라인드] [기각]  · [삭제](파괴적 → AlertDialog 확인)
  → useOne refetch + toast
```

| 컴포넌트                             | 출처                 | 비고                                                 |
| ------------------------------------ | -------------------- | ---------------------------------------------------- |
| `useOne`                             | Refine               | 복합 id로 대상+신고들 조회                           |
| Card/Separator/Button/Badge          | shadcn               | 재활용(문의 show)                                    |
| **AlertDialog**                      | shadcn(**신규 add**) | 삭제 등 파괴적 액션 확인                             |
| ReportActionBar                      | 신규                 | 블라인드/삭제/기각 버튼군 + dataProvider custom 호출 |
| ReportReasonBadge / ContentTypeBadge | 신규                 | S1과 공유                                            |

### 신규 컴포넌트 사유

- **ReportReasonBadge / ContentTypeBadge**: 신고 reason·대상유형은 도메인 칩 — shadcn 기본에 없음. 문의 뱃지처럼 라벨·색 매핑만.
- **ReportActionBar**: 블라인드/삭제/기각은 비표준 액션(POST /handle) — 문의 답변/상태 액션과 유사하나 reason·파괴성 다름. confirm 포함.
- **AlertDialog 추가**: 삭제(영구)·블라인드는 되돌리기 어려운 조치 → 확인 다이얼로그 필수(BP). keeper-admin에 아직 없음 → `npx shadcn add alert-dialog`.

## 4. keeper-admin 구조 매핑

| 컴포넌트/모듈 | 위치                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 신고 리소스   | `src/pages/reports/{list,show}.tsx`                                                                                                |
| 뱃지·액션     | `src/components/report-badges.tsx`, `src/pages/reports/report-action-bar.tsx`                                                      |
| 처리 API 호출 | `src/providers/report-actions.ts`(handle: blind/delete/dismiss, apiFetch 재사용)                                                   |
| dataProvider  | 기존 `src/providers/dataProvider.ts` — `reports` 리소스 분기(getList=/admin/reports, getOne=복합 id 분해→/admin/reports/:type/:id) |
| 사이드바 메뉴 | `src/components/layout/app-layout.tsx` NAV에 "신고"(Flag 아이콘) 추가                                                              |
| 상수          | `src/constants/report.ts`(REASON_LABEL·ACTION)                                                                                     |

## 5. 의존성

- 라이브러리 추가: **shadcn alert-dialog**(`npx shadcn add alert-dialog`). 그 외 재활용.
- 백엔드: `GET /admin/reports`·`GET :type/:id`·`POST :type/:id/handle` + `PostComment.isHidden` 마이그레이션(→ /spec, /be).
- 통지 UI는 이번 범위 밖(알림 시스템).

## 6. ADR + Open Issues

### 결정 기록

| 결정      | 옵션                     | 채택                  | 사유                                                         |
| --------- | ------------------------ | --------------------- | ------------------------------------------------------------ |
| 큐 단위   | reason별 행 vs 대상별 행 | 대상별(글/댓글 1행)   | 같은 글 다중신고 한 줄(Reddit/Blind). 상세에서 신고 N건 펼침 |
| Refine id | 단일 id vs 복합 type:id  | 복합 `type:id`        | 글/댓글 2종을 한 리소스 큐로. dataProvider에서 분해          |
| 삭제 확인 | 즉시 vs AlertDialog      | AlertDialog           | 영구 삭제·블라인드는 파괴적 → 확인(PartnerHero 마찰 BP)      |
| 화면 패턴 | 신규 vs 문의 재활용      | 문의 list/show 재활용 | 동일 admin 테이블+상세 패턴. 일관성·속도                     |

### Open Issues (→ /spec)

- TBD — `GET /admin/reports` 집계 응답 정확한 필드(대상 미리보기·신고수·대표사유 선정 규칙) + Refine getList 매핑(복합 id 생성).
- TBD — 블라인드 액션 후 큐에서 사라질지(완료 필터) vs 완료 표시로 유지.

## 참고

- PRD: docs/prd/report-moderation.md · 백로그: docs/backlog/features/report-moderation.md
- 패턴 출처: keeper-admin 문의 슬라이스(list/show) · 레퍼런스 shadcn-admin 데이터테이블
