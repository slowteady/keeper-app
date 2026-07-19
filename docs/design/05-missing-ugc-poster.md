# Design — 실종·분실 유저 작성(Phase 2) + 실종 전단 생성

> 상태: 확정 (2026-07-14)
> 입력: `docs/prd/05-missing-ugc-poster.md` · Figma 없음(Case B, 재활용 자산 조립)
> UI만 다룸. 데이터모델·백엔드는 `/spec`.

## 재활용 판정 요약 (실측)

| 자산                                                                                           | 판정          | 근거                                                                  |
| ---------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------- |
| `LabelTextField`·`LabelChipGroup`·`LabelImageSelector` (`features/community/create/ui/field/`) | **그대로**    | `<T extends FieldValues>` 제네릭 — `MissingCreateFormDto`에 바로      |
| `LocationBottomSheet`+`useLocationBottomSheet` (`features/address/`)                           | **그대로**    | 카카오 키워드→좌표 콜백, 도메인 무관                                  |
| `WriteFab` (`shared/ui/button/`)                                                               | **그대로**    | label/onPress/scrollY 제네릭, missing 목록에 추가                     |
| `PosterPreviewSheet`·`PosterSaveButton` (`features/poster/`)                                   | **generic화** | `desertionNo` 고정 → 소스(`{type,id}`) 파라미터화, UI 스켈레톤 재사용 |
| adopt 카드 dim+상태칩 (`entities/adopt/ui/adopt-card.tsx` 내부, 미export)                      | **추출**      | 파일-로컬 → `shared/ui`로 추출해 실종 카드와 공유                     |
| adopt 상세 상태배너 (`app/(untabs)/adopt/[id]` 내부, 미export)                                 | **패턴만**    | tone/label이 adopt 전용 → 실종용 신규, 톤 시스템만 참고               |
| `ContactSelectField`                                                                           | **컷**        | 복수 연락처 구조라 실종 단일 전화엔 과함 → `LabelTextField`로 대체    |
| `ShelterMap` (`entities/shelter/`)                                                             | **컷**        | 다중 마커 `ShelterDto` 전용 → 단일 핀 지도 신규                       |
| `entities/missing/*` (Phase1)                                                                  | **확장 신규** | 공공 read-only 슬라이스 → status·유저작성 스키마/작성 폴더 부재       |
| `entities/comment`·`features/community/detail`(대댓글)                                         | **그대로**    | 실종 상세 제보 댓글에 재활용                                          |

## 화면 1 — 실종 목록 (`app/(untabs)/missing/index.tsx` 확장)

```
MissingListScreen
├─ MissingListSection (widgets/missing-section, 확장)   FlashList numColumns=1
│   └─ MissingCard (entities/missing/ui, 확장)
│        ├─ 사진 썸네일 · 이름/품종 · 실종일 · 지역
│        └─ [status=RESOLVED] → StatusDimOverlay + StatusChip("찾음")   ← shared/ui 추출
├─ WriteFab (shared/ui/button, 그대로)  label="실종글 쓰기" → /missing/write
└─ (공공 LostAnimal + 유저 PostMissing 통합 · 뱃지 없음 · 실종일 정렬)
```

### 진입 동선 — 홈 히어로 하단 액션 바 (신규)

기존 `HomeMissingHero`(홈 탭)가 실종 게시판의 유일 진입점. 카드는 **둘러보기**만 담당(슬라이드 탭=상세, 카운터=전체보기). Phase2에서 **작성(신고) 진입을 카드 밖 전용 액션 바로 분리**해 추가:

```
[HomeMissingHero 카드]  ← 그대로 (탭=상세, 카운터=/missing 전체보기)
HeroReportCta (신규, 카드 밖)
├─ "잃어버린 아이가 있나요?"           프롬프트
└─ Button "실종 신고하기 →" (keeper 그린)  → /missing/write
```

- **신규 `HeroReportCta`**(`widgets/home-section/ui`): 홈에서 **1탭에 작성 폼** 진입. 사유(BP): 실종은 긴급 도메인 → 신고를 둘러보기와 분리해 얕고 눈에 띄게(포인핸드=홈에 실종신고 별도 메뉴, PawBoost=신고 최우선). 카드 안 오버레이는 캐러셀 press 충돌·정보 자리 경쟁이라 **카드 밖 분리**.
- 목록의 `WriteFab`은 "둘러보다 쓰는" 보조 경로로 유지(제거 아님).

- **신규**: `StatusDimOverlay`+`StatusChip`(shared/ui) — adopt 카드 내부 로컬 컴포넌트를 export 위치로 추출, 실종·입양 공용. 사유: 상태 dim+칩이 두 도메인 공통 패턴인데 현재 파일-로컬이라 공유 불가.
- MissingCard는 통합 리스트라 소스(공공/유저) 무관 동일 카드. 탭 시 소스별 상세 라우팅.

## 화면 2 — 실종글 작성/수정 (`app/(untabs)/missing/write.tsx` 신규)

BP 폼 순서: **사진(필수) → 특징 → 실종일시 → 위치 → 보상 → 연락**.

```
MissingWriteScreen (features/missing/create)
├─ KeyboardAwareScrollView
│   ├─ LabelImageSelector   (그대로)  사진 다중 필수
│   ├─ LabelTextField       (그대로)  이름(선택)
│   ├─ LabelChipGroup       (그대로)  품종/종(개·고양이·기타)
│   ├─ LabelTextField       (그대로)  색·특징
│   ├─ MissingDateField     (신규)    실종일시 — DateTimePicker 래핑
│   ├─ LocationPickField     (신규 얇게)  탭 → LocationBottomSheet(그대로) present → 주소+좌표
│   ├─ LabelTextField       (그대로)  보상(선택, 숫자)
│   └─ LabelTextField       (그대로)  연락 전화(**필수**)
└─ SubmitButton (shared/ui)  useCreateMissing(신규)
```

- **신규**: `MissingDateField`(실종일시 — 기존 폼에 날짜 입력 없음), `LocationPickField`(LocationBottomSheet 여는 얇은 Controller 래퍼). 사유: 개인입양 폼엔 날짜·위치 필드가 없음. 각각 기존 `Label*` 패턴 따라 얇게.
- **전화 공개 토글 삭제**: `isPhonePublic` 제거(번호 필수+항상 로그인게이트 노출로 단일화). 전화 필드는 필수 입력.
- `useCreateMissing`: `use-create-post` 골격(rhf+zodResolver+업로드 뮤테이션) 패턴 따르되 엔드포인트/DTO 신규.

## 화면 3 — 실종글 상세 (`app/(untabs)/missing/post/[id].tsx`, 유저글 전용)

**설계 기준(재작업): 기존 구 실종 상세(`missing/[id]/index.tsx`, 공공 LostAnimal)의 상세 골격을 그대로 따르고, 유저작성에서 늘어난 항목만 그 아래 섹션으로 얹는다.** 구 실종 상세는 이미 adopt 계열 표준(Hero 풀블리드 캐러셀 → 공유행 → 아이콘 라벨 "실종 정보" 블록 → `DetailSpecSection` "기본정보" 카드 → 하단 `BottomButton`)을 따르고 있었는데, 1차 구현이 QnA를 복사하며 이 골격(특히 아이콘 라벨·`DetailSpecSection` 카드)을 누락해 반려됨. → 구 실종 구조로 정렬.

```
MissingDetailContent (features/missing/detail, FlashList)
── ListHeaderComponent ────────────────────────────────
├─ [status=RESOLVED] MissingResolvedBanner            상단 "가족을 찾았어요" 배너   (추가항목)
├─ Hero  Carousel imageRadius=0 aspectRatio 4/3        구 실종 그대로 · 풀블리드
├─ ActionRow  공유 아이콘 (px SCREEN_GUTTER, flex-end) 구 실종 그대로
├─ YStack px=SCREEN_GUTTER gap=32                      구 실종 그대로 (gap 32)
│   ├─ MissingInfoSection                              구 실종 골격 그대로 재정렬
│   │   ├─ "실종 정보"  아이콘 라벨 블록 (InfoRow, width68)
│   │   │    ├─ Clock  + 실종일시 (lostAt)
│   │   │    └─ MapPin + 실종장소 (address)
│   │   ├─ DetailSpecSection "기본정보" 카드           widgets/adopt-section 재활용
│   │   │    rows: 종류(animalType·breed) · 성별(gender) · 색·특징(colorFeature) · 사례금(reward)
│   │   └─ [description] 상세 서술 블록                구 실종 톤 (라벨+본문)
│   ├─ MissingLocationMap  단일 핀 지도                (추가항목 — 유저글 좌표)
│   ├─ ContactCta / ResolveToggle  인라인 블록버튼     전화=구 BottomButton 문구·CallModal 재활용
│   ├─ MissingPosterButton "실종 전단 만들기"          (추가항목) → PosterPreviewSheet
│   └─ MissingMatchSection "이 아이일 수 있어요"        (추가항목) AdoptCard 가로
├─ Divider
└─ CommentListHeader "제보 N"
── items = 댓글 (CommentCard + RepliesSection) ────────  entities/comment·features/community 그대로
── sticky 하단 = CommentFormInput "목격 정보를 남겨주세요"   (추가항목 — 핵심 가치)
```

- **재활용(구 실종/adopt 계열 그대로)**: Hero 풀블리드 캐러셀, 공유 `ActionRow`, 아이콘 라벨 "실종 정보" 블록(Clock/MapPin + width68 라벨 + flex1 값), `DetailSpecSection`(widgets/adopt-section) "기본정보" 카드, `CallModal`·"보호자에게 전화하기" 문구.
- **신규(유저글 추가항목)**: `MissingResolvedBanner`(adopt 배너 톤 참고), `MissingLocationMap`(단일 핀 — ShelterMap 다중마커와 목적 다름, naver map 프리미티브만 재사용), `MissingMatchSection`(발견매칭, 후보=AdoptCard 재활용), `MissingPosterButton`, `ResolveToggle`(작성자 "찾았어요"). 제보 댓글은 `entities/comment`+`features/community` 그대로.
- **CTA 위치 — 유일한 구 실종과의 차이**: 구 실종은 하단 고정 `BottomButton`이지만, 유저글은 제보 댓글 sticky 입력바가 하단을 점유(핵심 가치)하므로 "보호자에게 전화하기"를 본문 인라인 블록 버튼으로 내린다(문구·`CallModal`·disabled 톤은 구 실종 재활용). 작성자면 그 자리에 `ResolveToggle`.
- **작성자/제목 헤더 미도입**: 구 실종 상세가 Hero→공유→정보 구조라, 일관성 위해 작성자 행·제목을 넣지 않는다(개인입양 상세의 AuthorRow/PostCardTitle 미러 안 함).
- 공공(LostAnimal) 상세는 Phase1 그대로(읽기전용, 제보댓글·전단·해결 없음). 유저글 상세만 위 확장.

## 화면 4 — 실종 전단 미리보기/공유 (`PosterPreviewSheet` generic화)

```
PosterPreviewSheet (features/poster, generic화: source={type:'missing', id})
├─ 포스터 이미지 미리보기 (satori 렌더 결과, R2)
├─ PosterSaveButton  다운로드(카메라롤)
└─ ShareButton (기존 share feature)  카톡/인스타/기타 공유시트
```

- BP: 입력 즉시 결과물 → 미리보기 모달 + 공유시트(Canva/Animalert 표준). 인쇄 A4/소셜 2포맷은 후속(P1). MVP 단일 세로 포맷.
- generic화: `posterQueries.adopt(desertionNo)` → `posterQueries.poster(source)` 로 소스 파라미터화. 실종 소스 추가.

## FSD 슬라이스 매핑

| 컴포넌트                                                                                                             | 슬라이스                                          |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `StatusDimOverlay`·`StatusChip`                                                                                      | `shared/ui/` (추출, 공용)                         |
| `HeroReportCta`                                                                                                      | `widgets/home-section/ui/`                        |
| `MissingDateField`·`LocationPickField`                                                                               | `features/missing/create/ui/field/`               |
| `useCreateMissing`·`useMissingDetail`·`useResolveMissing`                                                            | `features/missing/*/model/`                       |
| `MissingInfoSection`·`MissingLocationMap`·`ContactCTA`·`MissingMatchSection`·`MissingResolvedBanner`·`ResolveToggle` | `features/missing/detail/ui/`                     |
| `MissingCard`(status 확장)·schema·mapper                                                                             | `entities/missing/`                               |
| `MissingListSection`(확장)                                                                                           | `widgets/missing-section/`                        |
| 작성/상세 라우트                                                                                                     | `app/(untabs)/missing/write.tsx`·`[id]/index.tsx` |
| 전단 시트/버튼 generic화                                                                                             | `features/poster/`                                |

## 신규 컴포넌트 & 사유 (총괄)

| 신규                                   | 사유                                                   |
| -------------------------------------- | ------------------------------------------------------ |
| `StatusDimOverlay`/`StatusChip` (추출) | adopt 파일-로컬 → 실종·입양 공용화                     |
| `HeroReportCta`                        | 홈 히어로 하단 신고 진입(긴급 액션 얕게, 카드 밖 분리) |
| `MissingDateField`                     | 실종일시 — 기존 폼에 날짜 입력 없음                    |
| `LocationPickField`                    | LocationBottomSheet 여는 Controller 래퍼(폼 통합)      |
| `MissingInfoSection`                   | 실종 특화 정보 블록                                    |
| `MissingLocationMap`                   | 단일 핀 지도 — ShelterMap(다중마커) 목적 상이          |
| `ContactCTA`                           | 로그인 게이트+전화, 공공 contact 패턴 미러             |
| `MissingMatchSection`                  | 발견매칭 "이 아이일 수 있어요"(후보=AdoptCard 재활용)  |
| `MissingResolvedBanner`                | 실종 해결 배너(adopt 톤 패턴만 참고)                   |
| `ResolveToggle`                        | 작성자 찾음 처리                                       |
| `useCreateMissing`/`useResolveMissing` | 실종 엔드포인트 전용                                   |

## 외부 UI BP 근거

- 폼: PawBoost/Petco = 사진 최우선·필수. 당근 = 위치 하단 옵션.
- 상세: 지도 옵션 배치(당근), Ring = Resolved 배지.
- 전단: PawBoost/Animalert/Canva = 입력 즉시 결과 + 미리보기 + 공유/다운로드, 2포맷은 후속.
- 발견매칭: Petco는 별도 결과 화면 — keeper는 상세 내 연관추천 카드로 경량화.
