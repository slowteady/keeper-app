# Design: 개인입양 상세 페이지 재설계 (BP 기반)

## 1. 메타

- 작성일: 2026-06-16
- 상태: 확정 (구현 대기)
- 입력 PRD: 없음 — BP 딥조사 + 현재 IA 기반 재설계
- Figma URL: 없음 — 기존 조각 컴포넌트 조립 기반
- BP 조사: 경쟁사 상세 IA(Petfinder·Adopt-a-Pet·당근·번개) + 입양 의사결정 정보 우선순위 7축

## 2. 문제 / 목표

- 현재 개인입양 상세는 `CommunityDetailOverviewSection`(작성자+제목+캐러셀+칩+소개글 묶음)이 최상단이라, **사진·핵심팩트보다 작성자가 먼저** 노출되고 **핵심팩트(나이·성별·크기)가 소개글 아래**로 밀려 있음.
- BP: 입양 결정 정보 순위는 사진 → 핵심팩트(나이/크기/품종=1순위 필터) → 건강 → 성격 → (게시자·연락은 결정 막판). 사진은 인게이지먼트 최대 동인.
- 목표: 결정 정보를 above-the-fold로, 게시자/연락은 하단/문의 직전으로 재배치. **QnA 상세와 공유하는 Overview는 무영향**.
- Non-Goals: 상시 안전 고지 신설(문의 시점 유지로 확정), 축종별 강조 차등(기획 보류), 캐러셀 신규 도입(이미 존재).

## 3. 컴포넌트 매핑

### S1: 개인입양 상세 (`/(untabs)/adopt-personal/[id]`)

재구성 후 컴포넌트 트리 (위→아래):

```
Container (ScrollView)
├── [입양완료 배너]            (isCompleted)
├── 이미지 캐러셀              ← above-the-fold
├── 제목 행 [Title ──── ♡ ⤴ ⋯]  ← 액션 우측
├── 칩 (축종·성별·입양유형)
├── 핵심팩트 그리드 (나이·성별·크기)   ← 소개글 위로
├── 소개글 (content)
├── 성격·행동 섹션            (behaviors)
├── 건강 섹션 (중성화·접종·검진)
├── 관련 링크                 (relatedLink)
└── 게시자 푸터 (아바타·닉네임·게시일)  ← 하단 이동
(sticky) 하단 CTA (문의하기 / 입양완료처리)
```

매핑 표:

| 컴포넌트                                   | 출처                                 | 용도                   | 재활용            |
| ------------------------------------------ | ------------------------------------ | ---------------------- | ----------------- |
| `CommunityAdoptCardCarousel`               | entities/community                   | 이미지 캐러셀(뷰어)    | 재활용            |
| `CommunityAdoptCardTitle`                  | entities/community                   | 제목                   | 재활용            |
| `CommunityAdoptCardTags`                   | entities/community                   | 칩(축종·성별·유형)     | 재활용            |
| `AdoptBasicInfoGrid`                       | widgets/adopt-section                | 나이·성별·크기 그리드  | 재활용            |
| `CommunityDetailBehaviorSection`           | widgets/community-adopt-feed-section | 성격·행동 칩           | 재활용            |
| `CommunityDetailHealthSection`             | widgets/community-adopt-feed-section | 중성화·접종·검진       | 재활용            |
| `CommunityDetailDescriptionSection`        | widgets/community-adopt-feed-section | 관련 링크              | 재활용            |
| `CommunityAdoptCardHeader`                 | entities/community                   | 게시자(아바타·닉·시간) | 재활용(하단 배치) |
| `AnimatedHeart`·`ShareIcon`·`MoreVertical` | shared/ui·tamagui                    | ♡·⤴·⋯ 액션             | 재활용            |
| 제목+액션 행 / 게시자 푸터 래퍼            | features/community/detail/ui         | 배치 컨테이너          | 신규(로컬)        |

### 신규 컴포넌트 사유

- **`CommunityDetailOverviewSection` 미사용(분해 아님)**: 이 위젯은 QnA 상세와 공유되므로 구조를 바꾸면 QnA가 깨짐. 개인입양 상세에서는 위젯 대신 **조각 컴포넌트를 직접 조합**해 새 순서를 구성 → QnA 무영향.
- **제목+액션 행 / 게시자 푸터 래퍼**: 기존 Overview가 묶어 두던 레이아웃을 새 순서로 재배치하기 위한 얇은 컨테이너. `community-adopt-detail-content.tsx` 내 로컬 styled로 충분(별도 위젯화 불필요).

## 4. FSD 프론트 슬라이스 매핑

| 컴포넌트/변경                 | 슬라이스                     | 파일 경로                                                           |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------- |
| 상세 재구성(조각 조합)        | features/community/detail/ui | src/features/community/detail/ui/community-adopt-detail-content.tsx |
| 제목+액션 행·게시자 푸터 래퍼 | 동(同) 파일 로컬 styled      | 동(同)                                                              |

신규 슬라이스/파일 없음 — 기존 상세 컨테이너 1개 재구성.

## 5. 의존성

- 라이브러리 추가: 없음
- 다른 슬라이스 영향: **없음** — `CommunityDetailOverviewSection`(QnA 공유)·기타 섹션 위젯은 변경하지 않고 그대로 import만. QnA 상세 무영향.
- 데이터: 추가 필드 불필요(현 `data`의 detailPost·infos·behaviors·descriptions·contacts 그대로).
- 선행: 없음(독립 작업).

## 6. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                                      | 채택              | 사유                                                                      |
| ---------------- | ----------------------------------------- | ----------------- | ------------------------------------------------------------------------- |
| 캐러셀 위치      | 현행(3번째) vs 최상단                     | 최상단            | 사진=결정 1순위 동인(+500% 인게이지먼트). 이미 캐러셀이라 도입은 불필요   |
| 핵심팩트 위치    | 소개글 아래(현행) vs 위                   | 소개글 위         | 나이·크기·품종이 입양자 1순위 필터, 스크롤 전 노출                        |
| 게시자 위치      | 상단 유지 vs 하단 이동                    | 하단 이동         | 결정정보 먼저, 게시자는 문의 직전 확인(당근·Petfinder 패턴) (사용자 확정) |
| 액션(♡·⤴·⋯) 위치 | 이미지 오버레이 vs 제목 행 우측 vs 상단바 | 제목 행 우측      | 게시자 하단 이동 시 액션은 above-fold 유지 + 사진 위 클러터 회피          |
| 안전 고지        | 상세 상시 노출 vs 문의 시점만             | 문의 시점만(현행) | 무상·비중개라 문의 시 `ContactSafetyNotice`로 충분(사용자 확정)           |
| 성격·건강 표시   | 아코디언 접기 vs 전개                     | 전개 유지         | 입양 결정 비교 정보 — 접으면 접근비용↑(NN/g)                              |
| Overview 처리    | 공유 위젯 분해 vs 조각 직접 조합          | 조각 직접 조합    | Overview는 QnA 공유 → 분해 시 QnA 회귀. 조각 조합이 무영향                |

### Open Issues

- 픽셀 단위 비주얼(제목+액션 행 간격, 게시자 푸터 블록 스타일·구분선)은 구현 후 시뮬 스크린샷으로 확정 — 프로젝트 반복 패턴.
- 축종별 강조 차등(개=신체/고양이=성격)은 데이터 근거 있으나 단일 그리드 톤과 충돌 → 보류.

## 참고

- 외부 UI BP: [Pawlytics 입양 프로필 데이터](https://pawlytics.com/2024/10/04/adoptable-pet-profiles-data-driven-insights-to-boost-pet-adoptions/) · [Petfinder 리스팅 가이드](https://pro.petfinder.com/help/add-new-pet-listing/) · [당근 trust](https://www.daangn.com/kr/trust/) · [NN/g·UXPin 프로그레시브 디스클로저](https://www.uxpin.com/studio/blog/what-is-progressive-disclosure/)
- 현재 구현: `src/features/community/detail/ui/community-adopt-detail-content.tsx`
- Figma: 없음
