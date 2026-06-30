# Design: 루트 랜딩(keeper-web /) UI 재설계

## 1. 메타

- 작성일: 2026-06-29
- 상태: 확정
- 입력: `docs/backlog/landing-redesign.md` (PRD 생략 — A 경로, 백로그가 요구사항 커버)
- Figma URL: 없음 — 컴포넌트 조립 기반(Case B). 외부 UI BP는 백로그 레퍼런스 섹션 참조
- 대상 레포: keeper-web (Next.js app router + Tailwind, 정적, Vercel). keeper-app FSD 비해당 → keeper-web 구조로 매핑

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명          | 진입 경로                              | 다음 화면                                    |
| ------- | --------------- | -------------------------------------- | -------------------------------------------- |
| S1      | 루트 랜딩 (`/`) | 직접 방문 / 검색 / our-keeper.com 루트 | App Store · Google Play (외부) / 약관 페이지 |

단일 화면, 스크롤 단일 컬럼. 인터랙션은 스크롤 + 배지/링크 클릭뿐.

## 3. 컴포넌트 매핑

### S1: 루트 랜딩

컴포넌트 트리:

```
page.tsx (서버 컴포넌트)
├── LandingNav            ① keeper. 로고 + [다운로드] 버튼(앵커 #dl)
├── LandingHero           ② "지금 {N}마리가…" 헤드라인 + 서브 + 본문③
│   └── PendingCount       (숫자 N — 1차 placeholder, Phase2 실연동)
├── WaitingPets           ④ "지금 기다리는 아이들" + 사진 줄(placeholder)
│   └── PetPhotoPlaceholder × N
├── WhatYouCanDo          ⑤ 기능 4줄 리스트(카드 grid 아님)
├── StoreBadges           ⑥ App Store / Google Play 공식 배지 (#dl)
└── LandingFooter         ⑦ 약관·개인정보·커뮤니티정책·문의
```

매핑 표:

| 컴포넌트            | 출처       | 용도                                      | 재활용 여부 |
| ------------------- | ---------- | ----------------------------------------- | ----------- |
| LandingNav          | 신규       | 상단 로고 + 다운로드 앵커                 | 신규        |
| LandingHero         | 신규       | 헤드라인·서브·본문(②③)                    | 신규        |
| PendingCount        | 신규       | 공고 합산 숫자 N 표시(placeholder→실연동) | 신규        |
| WaitingPets         | 신규       | 기다리는 아이들 사진 줄(④)                | 신규        |
| PetPhotoPlaceholder | 신규       | 사진 자리 placeholder(라벨 포함)          | 신규        |
| WhatYouCanDo        | 신규       | 기능 4줄(⑤)                               | 신규        |
| StoreBadges         | 신규(공용) | 공식 스토어 배지 — 루트+필요시 재사용     | 신규        |
| LandingFooter       | 신규       | 약관 링크 footer                          | 신규        |

### 신규 컴포넌트 사유

- keeper-web에는 재사용 가능한 UI 컴포넌트가 `PolicyContent.tsx`(약관 전용)뿐 → 랜딩 섹션은 전부 신규 불가피.
- 기존 `page.tsx`는 이모지·바운스 기반 저품질 → 재활용 가치 없음, 전면 교체.
- StoreBadges만 공용(`src/components/`)으로 분리 — share 등 다른 곳에서 스토어 유도 시 재사용 여지. (단 share의 `OpenAppButton`은 동적 딥링크 분기라 별개 — StoreBadges는 단순 스토어 링크 배지)

## 4. keeper-web 파일 배치

| 컴포넌트                          | 위치          | 파일 경로                                    |
| --------------------------------- | ------------- | -------------------------------------------- |
| page (조합)                       | app route     | `src/app/page.tsx`                           |
| LandingNav                        | 랜딩 colocate | `src/components/landing/landing-nav.tsx`     |
| LandingHero / PendingCount        | 랜딩 colocate | `src/components/landing/landing-hero.tsx`    |
| WaitingPets / PetPhotoPlaceholder | 랜딩 colocate | `src/components/landing/waiting-pets.tsx`    |
| WhatYouCanDo                      | 랜딩 colocate | `src/components/landing/what-you-can-do.tsx` |
| LandingFooter                     | 랜딩 colocate | `src/components/landing/landing-footer.tsx`  |
| StoreBadges                       | 공용          | `src/components/store-badges.tsx`            |

- 기존 `src/components/` 패턴(PolicyContent) 따름. 랜딩 섹션은 `src/components/landing/` 하위에 모음.
- 전부 서버 컴포넌트(인터랙션 없음). 스크롤·앵커는 순수 CSS/HTML.

## 5. 의존성

- 라이브러리 추가 설치: 없음 (Tailwind + Next.js Image로 충분)
- 다른 영역 변경 영향: 없음 (page.tsx 교체, 기존 share/policy 무관)
- 선행 작업: 없음(1차). Phase2 숫자 실연동만 백엔드 카운트 API 의존
- 에셋: **공식 Apple/Google 스토어 배지 SVG** → `public/badges/`에 추가 필요(현재 없음)

## 6. ADR + Open Issues

### 결정 기록

| 결정           | 옵션                                     | 채택                          | 사유                                              |
| -------------- | ---------------------------------------- | ----------------------------- | ------------------------------------------------- |
| 전체 톤        | 기능카드 grid(AI템플릿) vs 드라이 사실형 | 드라이 사실형                 | 양질 레퍼런스 전부 grid 폐기, 1인칭 감정서술=오글 |
| Hero 메인      | 추상 카피 vs 실데이터 숫자               | 실데이터 숫자(N)              | 숫자가 미사여구 없이 진심 전달                    |
| 숫자 N 범위    | 보호소만 vs 보호소+개인                  | 보호소+개인 합산              | 사용자 결정 — 개인 공고 포함                      |
| 숫자 연동 시점 | 1차 실연동 vs placeholder                | 1차 placeholder→Phase2 실연동 | 이미지 placeholder 방침과 일관, 구현 단계화       |
| 마무리 문구    | 신념 문구 vs 없음                        | 없음→배지 바로                | 사용자 "아쉬움" → 군더더기 컷                     |
| 컴포넌트 위치  | app colocate vs src/components           | src/components/landing        | 기존 PolicyContent 패턴 일관                      |

### Open Issues

- TBD — 공식 스토어 배지 SVG 에셋 확보(Apple/Google 가이드라인 준수본 → `public/badges/`)
- TBD — Phase2: 백엔드 보호소+개인 공고 카운트 엔드포인트 존재 확인(없으면 추가) + ISR revalidate 주기
- TBD — WaitingPets 사진 수(4컷 제안) 및 모바일 가로 스크롤 vs 그리드

## 참고

- 백로그: `docs/backlog/landing-redesign.md`
- 외부 UI BP: [당근 about](https://about.daangn.com/) · [배민 B컷](https://bcut.baemin.com/) · [Adopt-a-Pet](https://www.adoptapet.com/) · [Rover](https://www.rover.com/)
- 카피 BP: [Shopify Landing Page Copy](https://www.shopify.com/blog/landing-page-copy) · [동물권 카라](https://www.ekara.org/)
- 동기: [[project_keeper_motivation]]
