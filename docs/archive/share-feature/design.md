# Design: 공유하기 (share) — UI

> 입력: docs/prd/share-feature.md, docs/backlog/share-feature.md, 선행 docs/spec/share-link.md. Figma 없음 → Case B.
> BP 기조사 완료(진입점=헤더 독립 아이콘, 착지=프리뷰+단일 CTA+Smart Banner).

## 현황 정정 (중요)

PRD/backlog 작성 시 "community 공유가 ⋮ 메뉴에 숨어있다"고 봤으나 **코드 확인 결과 오인**:

- `usePostMenu`(`features/community/detail/model/use-post-menu.tsx`)의 ⋮ 메뉴 항목 = 수정/삭제(작성자) 또는 신고/차단(타인). **공유 항목 없음.**
- 공유(`sharePost`)는 `PostDetailHeader`(community 상세 본문 상단)의 **↗ 아이콘에 이미 배선**(`onPressShare`, `testID="community-detail-share"`).

→ **community 공유는 이미 헤더 노출. adopt·shelter·community 3화면 일관 이미 충족. PRD FR6 = no-op(작업 없음).**

## 화면 1 — community 글 상세 헤더 (변경 없음, 현황 확정)

```
PostDetailHeader (widgets/community-post-section/ui/post-detail-header.tsx)
  HeaderWrapper (XStack, space-between)
    ├ PostCardHeader   작성자 아바타+닉네임+시간
    └ XStack(gap 16)   [ ♡ 하트 ] [ ↗ 공유 ] [ ⋮ 더보기 ]
  PostCardTitle / PostCardCarousel / PostCardTags / Content
```

- 공유 ↗ = `ShareIcon`(shared/ui/icons/outline), 하트·더보기와 한 행. 이미 BP(헤더 독립 아이콘) 충족.
- **adopt 상세**: 본문 ActionRow에 하트+↗(`AnimatedHeart`+`ShareIcon`). **shelter 상세**: 동일 share 호출. → 3화면 공유 진입점 일관.
- 변경 사항 없음.

## 화면 2 — keeper-web 공유 착지 `/share/[type]/[id]` (별도 레포, 와이어 제안)

> FSD 범위 밖. keeper-web(Next.js, Vercel) 구현. 여기서는 컴포넌트 트리·배치 제안만.

```
<head>
  generateMetadata → og:title/description/image (GET /shares/:type/:id)
  <meta name="apple-itunes-app" content="app-id=..., app-argument=https://our-keeper.com/share/{type}/{id}">  // iOS Smart Banner
</head>

SharePage
  ├ PreviewCard            OG 이미지(없으면 로고) + 제목 + 설명(요약)
  │     · adopt: 대표사진 + 품종·성별·나이
  │     · shelter: 로고 + 보호소명·주소
  │     · community: 첫 이미지 + 제목·본문요약 (연락처 X)
  ├ PrimaryCTA             "앱으로 보기"  → universal link(설치 시 앱) / 미설치 UA 분기 스토어
  │     · iOS: Smart Banner가 상단 자동 + 본문 CTA 1개
  │     · Android: JS UA 감지 → Play 스토어 링크 버튼(네이티브 Smart Banner 없음)
  └ Footer(경량)           keeper 로고 + 한 줄 소개 (루트 랜딩 재설계 전까지 최소)
```

- 단일 CTA 원칙(BP) — 버튼 1개. 콘텐츠 프리뷰가 설치 동기.
- API 실패/404 → 로고 + 기본 설명 fallback(share-link.md 계약).

## 딥링크 라우팅 (UI 아님 → /spec 이관)

- universal link / `keeper://{type}/{id}` 수신 → expo-router path 매핑(`/share/adopt/{id}` → `/(untabs)/adopt/[id]` 등). 매핑 테이블·수신 핸들러는 `/spec`에서 확정.

## 컴포넌트 매핑

| 컴포넌트                      | 출처                           | 재활용/신규       | 비고                     |
| ----------------------------- | ------------------------------ | ----------------- | ------------------------ |
| `PostDetailHeader` ↗          | widgets/community-post-section | 재활용(변경 없음) | community 공유 이미 노출 |
| adopt `ActionRow` ↗           | app/(untabs)/adopt/[id]        | 재활용            | 변경 없음                |
| `ShareIcon`                   | shared/ui/icons/outline        | 재활용            | 3화면 공통               |
| `SharePage`/`PreviewCard`/CTA | **keeper-web**                 | 신규(별도 레포)   | FSD 밖, 와이어만         |

### FSD 슬라이스

- keeper-app: **신규 컴포넌트 없음**(공유 진입점 기구현). 변경은 네이티브 config·딥링크 라우팅(→ /spec) 뿐.
- keeper-web: `/share/[type]/[id]` 페이지 + `PreviewCard`(별도 레포).

## ADR

- **community 헤더 승격 불필요**: 코드상 공유가 이미 헤더 ↗에 배선. FR6 no-op. (PRD/backlog 정정)
- **착지 단일 CTA**: 다중 버튼은 결정 분산. 프리뷰+CTA 1개가 전환 BP.
- **Android Smart Banner 미지원 → JS 버튼**: 네이티브 미지원이라 UA 감지로 직접 렌더.

## Open Issues

- 딥링크 path 매핑 테이블(FR2) → /spec.
- `type:'app'` 공유 행선지 = 루트(현행 유지).
- keeper-web 착지 페이지 정적 vs SSR — OG는 `generateMetadata`(SSR 메타) 필요, 본문은 정적 가능. keeper-web 레포에서 확정.
