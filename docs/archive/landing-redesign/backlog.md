# 백로그: 루트 랜딩(keeper-web /) UI 재설계

작성일: 2026-06-29
상태: 아이디어 확정·스펙 상세화 대기

---

## 배경 / 왜

- 현재 루트 랜딩(`keeper-web/src/app/page.tsx`)이 "AI가 찍어낸 듯한" 저품질 — 🐾 이모지 로고 + `animate-bounce`, 🍎🤖 이모지 스토어 버튼(공식 배지 미사용 = BP 위반), 앱 스크린샷·기능 소개 전무, 단일 뷰포트, 배경색 `#00D9A3`로 keeper 그린 `#1FE678` 불일치, 추상 카피만.
- 랜딩은 앱 다운로드의 첫 관문 — 신뢰도·전환율에 직결. 방치 시 출시 후 유입 전환 손실.

## 전략 축

1. **AI 템플릿 탈피** — 뻔한 "Hero + 기능카드 4 grid + CTA" SaaS 구조를 거부. 실제 레퍼런스(당근 about·배민 B컷 사람 목소리, Adopt-a-Pet 실데이터 콘텐츠)를 주축으로.
2. **드라이·진심 카피** — 1인칭 감정 고백("제가 ~해서 만들어요")은 오글거림 → 제거. 숫자·사실·신념으로 진심 전달([[project_keeper_motivation]] "한 마리라도 더").
3. **keeper 자산 전면화** — 실제 보호소+개인 공고를 콘텐츠로(숫자·사진). 포인핸드가 안 하는 차별점.

## 선행 조건

- 없음 (1차는 placeholder로 진행 가능). 숫자 실연동만 백엔드 공고 카운트 API 의존(후속).

## 핵심 가설

- 실제 공고 숫자("지금 N마리가 기다려요")가 추상 카피보다 즉시 설득력 높다 — 진심을 미사여구 없이 숫자로 증명.
- 1인 메이커/드라이 톤이 비영리·진정성 브랜드에 더 맞다(당근·배민 B컷 검증된 패턴).

## 데이터 모델 (초안)

- 프론트 전용(keeper-web 정적). 단 Hero 숫자 N = 보호소 공고 수 + 개인 입양 공고 수 합산 → keeper-backend 카운트 엔드포인트 필요(없으면 추가). ISR로 주기 갱신.

## 로드맵 (Phase 단위)

### Phase 1: MVP (이번)

- `page.tsx` 재작성 + 섹션 컴포넌트 분리(`_components/landing/`)
- 카피 확정본 적용, keeper 그린, 공식 스토어 배지 SVG
- 숫자·사진 전부 **placeholder**로 구조·디자인 완성

### Phase 2: 실데이터 연동 (후속)

- 백엔드 공고 카운트 API → Hero 숫자 N 실연동(ISR)
- WaitingPets 사진 줄 → 실제 공고 이미지 연동(선택)

## 확정 설계 (brainstorming 산출)

**섹션 구조** (스크롤 단일 컬럼):

1. Nav — keeper. 로고 + [다운로드]
2. Hero — "지금 **{N}마리**가 가족을 기다리고 있어요" / 서브 "전국 보호소부터 개인 입양 공고까지, keeper에서"
3. 본문 — "전국 보호소 공고를 실시간으로. 보호소도, 개인 입양도, 내 주변 지도까지 한 곳에."
4. WaitingPets — "지금 기다리는 아이들" + 사진 줄(보호소·개인 섞어, placeholder)
5. WhatYouCanDo — 보호소 공고 / 개인 입양 공고 / 보호소 지도 / 커뮤니티
6. (마무리 문구 없음) → 다운로드 배지 바로
7. Footer — 약관·개인정보·커뮤니티 정책·문의

**카피 톤**: 드라이, 1인칭 감정 서술 제거, 숫자·사실 위주. 마무리 미사여구 컷.
**디자인**: keeper 그린 `#1FE678`, 편지지톤 배경, 공식 Apple/Google 배지 SVG, 이미지=placeholder.

## 레퍼런스 BP

- [당근 about](https://about.daangn.com/) — 수치·기능 없이 관계 언어로 가치 전달 → keeper 드라이 톤 주축
- [배민 B컷](https://bcut.baemin.com/) — 기업색 없는 사람 목소리·대화체 → 진정성
- [Adopt-a-Pet](https://www.adoptapet.com/) — 실제 입양 대기 동물이 랜딩 콘텐츠 자체 → 숫자/사진 자산 전면화
- [Rover](https://www.rover.com/) — 기능 나열 없이 한 줄 헤드라인 + 실사 → 기능카드 grid 폐기
- 카피 BP: [Basecamp/Stripe/Calm](https://www.shopify.com/blog/landing-page-copy) "we/I 문장 금지, 사실·benefit 위주" · [동물권 카라](https://www.ekara.org/) "감정 호소 대신 구체·숫자"

## 컷한 옵션 (사유 명시)

- **기능 카드 4 grid** — AI 템플릿의 상징. 모든 양질 레퍼런스가 안 씀.
- **편지 1인칭 고백체** (컨셉 B 초안) — "제가 ~해서 만들어요"가 오글거림. 드라이 톤으로 대체.
- **마무리 신념 문구** ("사고파는 게 아니라...") — 사용자 "아쉬움" → 컷, 다운로드 배지로 깔끔 마무리.
- **인원수 노출**("혼자/둘이 만든다") — 개인정보·확장성 이유로 카피에서 제외.
- **FAQ·가격·후기 섹션** — 무료 비영리·초기라 불필요.
- **deferred deep link 수준의 동적화** — 범위 밖. 숫자/사진은 ISR placeholder→실연동 단계적.

## 오픈 이슈 / 결정 필요

- TBD — 백엔드에 보호소+개인 공고 카운트 엔드포인트 존재 여부 확인(없으면 추가, Phase 2)
- TBD — 공식 스토어 배지 SVG 에셋 확보(Apple/Google 가이드라인 준수본)
- TBD — Hero 숫자 갱신 주기(ISR revalidate 값)

## 참고

- 대상 레포: keeper-web (Next.js + Tailwind, 정적, Vercel)
- 관련: [[project_keeper_motivation]] · [[project_keeper_ia_role]] · [[project_domain_unify]] · [[project_share_deeplink]]
