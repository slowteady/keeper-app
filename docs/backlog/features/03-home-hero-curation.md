# 홈 히어로 — 운영자 큐레이션 배너/피처드

> 상태: **보류(2026-07-14)**. 프라임 히어로 슬롯은 이미 `HomeMissingHero`(실종·분실, 자동 구동)가 점유 중이고 그게 미션상 최상단 가치라 유지. 큐레이션의 값은 실종 히어로와 별개의 운영자 관리 프로모/캠페인 슬롯이 실제 필요할 때 생기는데, 현재 홍보할 구체 콘텐츠 없음(YAGNI) → 재개 트리거 = 운영자가 홈에 올릴 실 콘텐츠 발생. `banner1/2.png`는 실종 fallback일 뿐 큐레이션 대상 아님.
> (이전) 발산 완료(2026-06-30 BP 조사).
> `03-home-content-redesign.md` 의 슬롯1(프로모 배너)을 운영자가 코드 배포 없이 관리하는 큐레이션 시스템으로 확장. 사용자 요구 H1(콘텐츠 BP·제안) + H2(어드민 핸들링).

## 배경 / 문제

홈 상단 배너는 구현됐으나 코드 배포 없이는 콘텐츠를 못 바꾼다. 1인 운영자가 긴급 입양·캠페인·오늘의 아이를 직접 큐레이션·교체·예약하는 어드민 핸들링이 없다.

## 추천안

- **관리 면 = keeper-admin(Refine+shadcn) 배너 CRUD 페이지 추가.** 외부 헤드리스 CMS(Strapi/Contentful) 컷 — 운영 도구 이중화·과금. 기존 admin 재활용이 최소 비용.
- **노출 = 서버 필터** `isActive AND now ∈ [startsAt, endsAt] ORDER BY priority DESC LIMIT N`. `/bootstrap` payload 포함(초기 1회) 또는 별도 `/banners`.
- **콘텐츠 유형 우선순위(제안)**: URGENT(긴급 입양 임박) > CAMPAIGN(시즌) > EDITORIAL(오늘의 아이) > PROMO. URGENT 가 비영리 미션("한 마리라도 더") 행동 유도력 최고.
- **이미지 = 기존 R2 통일.**

## 레퍼런스 BP

| 서비스                 | 패턴                                                                          |
| ---------------------- | ----------------------------------------------------------------------------- |
| Nextdoor               | 긴급 3단계 알림 최상단 고정, 위기 시 전체화면 점령(파트너 데이터 자동 트리거) |
| 포인핸드               | 슬라이드 배너 + 스토리 피드(입양후기/임보/홍보), 홈 지속 개선 이력            |
| Petfinder              | 홈=검색 진입점(에디토리얼 아님), 피처드는 알고리즘(대형 데이터 전제)          |
| Adopt-a-Pet / WeRescue | urgency 태그(마감임박) + 매칭 push                                            |
| InAppStory             | 배너 스케줄링·이벤트 트리거(코드 배포 없이 운영자 갱신)                       |

## 데이터 모델 개요 (Banner)

`type(PROMO|URGENT|EDITORIAL|CAMPAIGN|NOTICE)` / `title?` / `imageUrl` / `deeplinkType(ANIMAL|COMMUNITY|SHELTER|EXTERNAL|NONE)` + `deeplinkId?`/`deeplinkUrl?` / `startsAt?` / `endsAt?` / `priority` / `isActive` / timestamps.

## 컷한 옵션

A/B 배너(데이터 인프라 과함), 알고리즘 자동 피처드·개인화(유저 행동 데이터 부족, 대형 데이터셋 전제), 외부 헤드리스 CMS(기존 admin 있는데 이중 도구).

## 오픈 이슈 (TBD)

- URGENT = 운영자 수동 입력 vs 공공 유기동물 API 마감일 자동 집계(`abandonment` 테이블 연동)
- 슬롯 수: 최대 N + priority 순 vs 단일 고정 히어로
- NOTICE 타입이 기존 공지띠배너와 역할 중복 → 히어로로 흡수 vs 별도 유지
- COMMUNITY STORY(입양후기 하이라이트)가 홈 커뮤니티프리뷰 슬롯과 겹침 → 히어로 제외 여부
- 배포 채널: `/bootstrap` 포함 vs `/banners` 분리

## 영향 (개요)

- **backend**: Banner 모델 + 마이그레이션, admin `GET/POST/PATCH/DELETE /admin/banners`, 공개 `GET /banners`(or bootstrap)
- **admin**: `pages/banners` CRUD(이미지 R2 업로드·기간·우선순위·딥링크)
- **app**: 홈 슬롯1을 banners 데이터 바인딩, 딥링크 라우팅(기존 share deeplink 매핑 재사용)

## 출처

- [Nextdoor 긴급 알림 리디자인 (TechCrunch)](https://techcrunch.com/2025/07/15/nextdoor-redesigns-app-with-ai-recommendations-local-news-and-real-time-emergency-alerts/)
- [포인핸드 App Store KR](https://apps.apple.com/kr/app/포인핸드/id1019549518)
- [Petfinder Pro Dashboard](https://pro.petfinder.com/)
- [InAppStory Mobile Banners](https://inappstory.com/solutions/banners)
- [6 Apps That Help Adoptable Animals (One Green Planet)](https://www.onegreenplanet.org/animalsandnature/apps-that-help-adoptable-animals-find-forever-homes/)
