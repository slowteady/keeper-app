# Design: IA 공고 통합 (개인입양 → 입양 탭)

## 1. 메타

- 작성일: 2026-06-15
- 개정: 2026-06-15 — **병합 단일 피드(interleave) 폐기 → 출처 세그먼트 모델로 전환** (아래 §0)
- 입력 PRD: `docs/prd/ia-notice-integration.md`
- Figma URL: 없음 — 컴포넌트 조립 기반 (Case B)

## 0. 개정 사유 (중요)

초기안은 공공+개인을 **한 피드에 섞어(interleave)** 보여주는 "통합 단일 피드 + 정규화 단일 카드"였다. 폐기한다.

- **이질성 문제**: 보호소 공고와 개인 공고는 보유 데이터가 다르다(공고기간/구조장소/마감 D-day는 보호소 전용, 개인엔 없음). 한 스크롤에 섞으면 카드가 이질적이고, 정규화로 억지 통일하면 보호소 카드의 핵심 정보(설명행·D-day)를 깎아야 한다.
- **제약**: 보호소 카드는 **변경 금지**(정보 밀도·D-day 유지).
- **결론(BP)**: 한 스크롤에 섞지 않고 **입양 탭 안에서 출처 세그먼트 [보호소 | 개인]로 전환**한다. 같은 탭 내 세그먼트 전환 시 **카드 구조는 통일**(Adopt-a-Pet+Rehome 사례)하되, 개인 카드는 **보호소 `AdoptCard`를 그대로 재사용**하고 데이터만 개인용으로 주입한다.
- **찜=좋아요**: 개인 공고의 "관심 표시"는 기존 좋아요(`post_like`)를 그대로 쓴다. 별도 찜(post_favorite)은 만들지 않는다(폐기됨).
- **이동**: 개인입양은 커뮤니티 탭에서 **빠져 입양 탭으로 이동**한다(라우트도 adopt 네임스페이스로 이동). 커뮤니티 탭의 실종·입양생활·Q&A 재배치는 **이번 범위 밖(공고 완료 후 후속)**.

## 2. 화면 목록 + 흐름

| 화면 ID | 화면명                  | 진입 경로          | 다음 화면                |
| ------- | ----------------------- | ------------------ | ------------------------ |
| S1      | 입양 탭 (출처 세그먼트) | 하단 탭 "입양공고" | S2-공공 / S2-개인 / 작성 |
| S2      | 공고 상세 (출처별 분기) | S1 카드 탭         | 문의 / 입양완료 처리     |
| S4      | 프로필 (내 공고)        | 하단 탭 "프로필"   | S2-개인 등               |

흐름: 입양 탭 상단 세그먼트로 **보호소 / 개인** 전환(섞지 않음). 보호소 카드 탭 → 공공 상세, 개인 카드 탭 → 개인 상세. 작성은 입양 탭 FAB → 개인 공고 작성.

(S3 커뮤니티 재구성은 이번 범위 제외 — §6.)

## 3. 컴포넌트 매핑

### S1: 입양 탭 — 출처 세그먼트 ★(집중)

```
app/(tabs)/adopt/index.tsx                          [수정 — Container]
├── 출처 세그먼트 [보호소 | 개인]                    [신규 — shared ButtonGroup/세그먼트 재사용]
├── (source=SHELTER) AdoptListSection               [재활용 그대로]
│   └── AdoptCard (보호소)                            [재활용 — 0 변경]
├── (source=PERSONAL) 개인 목록 섹션                  [신규 조립 — AdoptListSection 패턴 따름]
│   └── AdoptCard (개인)                              [재활용 + 데이터 주입 + 입양완료 옵셔널 오버레이]
└── AdoptWriteFab "개인 공고 올리기"                  [신규 — CommunityWriteFab 일반화/이동]
```

| 컴포넌트                  | 출처                     | 용도                        | 재활용                                              |
| ------------------------- | ------------------------ | --------------------------- | --------------------------------------------------- |
| 출처 세그먼트             | shared/ui                | 보호소/개인 전환            | 기존 ButtonGroup 패턴 재사용                        |
| AdoptListSection (보호소) | widgets/adopt-section    | 보호소 목록                 | **재활용 0 변경**                                   |
| AdoptCard                 | entities/adopt/ui        | 공고 카드(양 출처 공용)     | **재활용** + 입양완료 옵셔널 prop(개인만)           |
| 개인→AdoptCard 매퍼       | entities/adopt           | 개인 Post → AdoptCard props | **신규** (성별/칩/포맷은 보호소 mapper 컨벤션 따름) |
| AdoptWriteFab             | widgets/adopt-section/ui | 개인 공고 작성 FAB          | **신규**(CommunityWriteFab 일반화)                  |

**개인 카드 구성(AdoptCard 재사용)**:

- uri = `images[0]`, title = `specificType`(품종; 없으면 동물 라벨)
- 속성칩 = 동물종 / 성별(남아·여아) / 나이 / 중성화 — **보호소 mapper의 라벨·variant·색 그대로 따름**
- 설명행(description) = `[지역(location)]`, `[등록 N일 전(feedAt)]` — 보호소의 3줄(공고기간/지역/구조장소) 대신 2줄
- 관심 하트 = 우상단(=좋아요 `post_like` 토글)
- 입양완료 = 이미지 딤 + 좌상단 "입양완료" 뱃지 (개인 전용 옵셔널 오버레이; 보호소 경로 미사용)
- 생략: 작성자·아바타 / 댓글·조회 / 구조장소 / D-day / "개인" 뱃지(세그먼트로 출처 명확)

### S2: 공고 상세 (출처별 분기)

- 공공 상세 = 기존 `app/(untabs)/adopt/[id]` **재활용 그대로**
- 개인 상세 = **`app/(untabs)/adopt-personal/[id]` 신규 이동** (기존 `community/[id]` 개인입양 진입 제거)
  - 컨텐츠는 기존 개인입양 상세 구성 재활용 (공용 컴포넌트 `CommunityAdoptDetailContent`로 추출 — community/[id]와 공유)
  - **소유자 분기 CTA**(본문 끝 인라인 — 하단은 댓글 입력 sticky가 점유하므로 별도 고정 바 대신 "문의하기 자리"를 소유자용으로 교체, ADR "그 자리에" 원칙):
    - 비소유자 = "문의하기"(기존 contact 시트)
    - 소유자 = "입양완료 처리"(입양중) / "입양중으로 변경"(완료) — 변경 시 confirm
  - 완료 뱃지 prominent(상세 상단) + 카드 딤+뱃지
- 분기 = S1 카드 `onPress`가 출처에 따라 공공/개인 상세 라우트로

### S4: 프로필 (내 공고)

- `profile-activity-scene` [수정] — 개인입양 카테고리 라벨 → **"내 공고"**, 카드 ⋮ 메뉴에 **"입양완료로 변경"** 추가
- 관심(찜) = 좋아요와 동일하므로 **기존 "게시글 좋아요" 탭이 곧 개인 공고 관심목록** — 별도 통합 불필요(라벨만 정리)

### 신규 컴포넌트 사유

- **개인→AdoptCard 매퍼**: 개인 Post 데이터를 AdoptCard props로 변환. UI 신규 아님(데이터 레이어). 성별·칩·포맷은 보호소 mapper 재사용.
- **AdoptCard 입양완료 오버레이**: 기존 StatusBadge는 공공 종료 상태(enum) 전용. 개인 입양완료는 딤+뱃지가 필요해 **옵셔널 prop 추가**(보호소 경로 미영향 = 보호소 렌더링 불변).
- **AdoptWriteFab**: CommunityWriteFab은 타깃·라벨 하드코딩. 입양 탭용으로 prop화/이동.
- **하단 CTA 바**: 개인 상세에 고정 바가 없어 신규.

## 4. FSD 프론트 슬라이스 매핑

| 컴포넌트                  | 슬라이스                                 | 파일 경로                                               |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| 개인→AdoptCard 매퍼       | entities/adopt                           | `src/entities/adopt/mapper.ts` (mapToPersonalAdoptList) |
| AdoptCard 입양완료 prop   | entities/adopt/ui                        | `src/entities/adopt/ui/adopt-card.tsx`                  |
| 출처 세그먼트 + 개인 목록 | app/(tabs)/adopt + widgets/adopt-section | `src/app/(tabs)/adopt/index.tsx` 등                     |
| AdoptWriteFab             | widgets/adopt-section/ui                 | `src/widgets/adopt-section/ui/adopt-write-fab.tsx`      |
| 개인 상세 (이동)          | app/(untabs)/adopt-personal/[id]         | `src/app/(untabs)/adopt-personal/[id]/index.tsx`        |
| 하단 CTA / 상태 mutation  | features/community(또는 adopt)           | `model/use-adoption-status.ts`                          |

## 5. 의존성

- 라이브러리 추가: **없음**
- 백엔드 선행: 개인 목록 DTO에 `specificType·age·weight·location` 추가 + 입양중 우선 정렬(`/spec`)
- 영향 슬라이스: `entities/adopt`(매퍼·카드), `app/(tabs)/adopt`(세그먼트), `widgets/adopt-section`(개인 섹션·FAB), `app/(untabs)/adopt-personal`(상세 이동), `widgets/profile`(라벨)
- **이번 범위 밖**: `app/(tabs)/community` 재구성, 실종·입양생활 재배치 (공고 완료 후)

## 6. ADR + Open Issues

### 결정 기록

| 결정             | 옵션                                   | 채택                               | 사유                                                                                         |
| ---------------- | -------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------- |
| 두 출처 표현     | 한 피드 interleave / 출처 세그먼트     | **출처 세그먼트**                  | 데이터 이질 → 섞으면 이질적. IA "단일 귀결"=단일 목적지(≠단일 스크롤). BP(Strava류 세그먼트) |
| 개인 카드        | 신규 컴포넌트 / AdoptCard 재사용       | **AdoptCard 재사용 + 데이터 주입** | 세그먼트 전환 시 카드 구조 통일이 BP. 보호소 카드 0 변경                                     |
| 카드 레이아웃    | 리스트행(당근형) / 2열 그리드          | **2열 그리드(이미지 상단)**        | 입양=사진 브라우징. 리스트행은 C2C 중고 맥락이라 부적합(BP)                                  |
| 개인 관심 표시   | 신규 찜(post_favorite) / 좋아요 재사용 | **좋아요(post_like) 재사용**       | 찜=좋아요 동일 기능(사용자 확정). 중복 제거                                                  |
| 입양완료 표시    | 숨김 / 딤+뱃지 유지                    | **딤+뱃지(목록 유지)**             | 공고 갑자기 사라짐 방지(BP: 당근·eCommerce). 입양중 우선 정렬                                |
| 개인 상세 라우트 | community/[id] 유지 / adopt 이동       | **adopt-personal/[id] 이동**       | 메뉴가 커뮤니티→입양으로 이동하므로 라우트도 이동(사용자 확정)                               |
| 상태 변경 UI     | ⋮ 메뉴만 / 상세 하단 CTA               | **상세 하단 CTA(소유자 분기) + ⋮** | 발견성. 소유자는 문의하기 무의미 → 그 자리에 입양완료 처리                                   |

### Open Issues / 후속

- 후속(공고 완료 후) — 커뮤니티 탭 재구성: 실종분실 별도 위치, 입양생활 활성화, Q&A 정리
- 후속 — 개인 공고 공유 URL/딥링크 정합(라우트 이동에 맞춰)
- 후속 — 입양완료 시 문의자 통지(알림 시스템 붙을 때)

## 참고

- PRD: `docs/prd/ia-notice-integration.md` · Spec: `docs/spec/ia-notice-integration.md`
- 외부 UI BP: Petfinder/Adopt-a-Pet(2열 그리드·이미지 상단), Rehome(개인=기관 동일 카드), Strava(세그먼트 전환), 당근/Gumtree(리스트행=C2C 맥락이라 비채택)
