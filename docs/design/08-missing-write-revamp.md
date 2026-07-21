# 08. 실종 신고 작성 플로우 전면 재설계

작성일: 2026-07-18
상태: 구현·검증 완료 (`docs/spec/08-missing-write-revamp.md` → `docs/qa/08-missing-write-revamp.md`)

이 문서는 PRD 결정사항(사례금 제거·연락처 통일·선택 섹션 추가)을 겸한다 — 별도 `docs/prd/08-*.md` 없음.

## 배경

실종 신고 작성(`(untabs)/missing/write.tsx`)이 기존 작성 페이지·디자인 시스템을 참조하지 않고 독립적으로 설계되어 다음 문제가 있다.

1. **DS 이탈** — 표준 `FormLayout` 대신 `KeyboardAwareScrollView` + `buttonHeight` onLayout 보일러플레이트를 직접 조립. `LabelSelectField`가 있음에도 `MissingDateField`·`LocationPickField`를 전용으로 신규 작성(내부 구현 중복).
2. **FSD 위반** — `features/missing`이 `features/community`의 필드 컴포넌트를 import (동일 레이어 cross-slice 금지 위반).
3. **영상 미지원** — 커뮤니티에는 사진+영상 파이프라인이 완비되어 있으나 실종은 이미지 전용.
4. **사례금 필드의 부적절성** — 자유 텍스트 금액 필드가 플랫폼을 금전 분쟁 당사자로 노출.
5. **에러 UX 열위** — 커뮤니티는 첫 에러 필드로 scroll+focus하나 실종은 토스트만 노출.

## 조사 근거

- **사례금**: 국가동물보호정보시스템·Petco Love Lost는 사례금 필드 부재. PawBoost는 optional·비강조. 사례금 미지급·사기 분쟁 사례 다수(국내외). keeper 정체성("정보·연결 플랫폼, 집행 안 함")과 충돌.
- **폼 구조**: 필드 4개 이상은 멀티스텝이 전환율 우위라는 데이터가 다수 소스에서 일관. 단 6필드 규모에서는 이득이 작고, 실종 신고는 급박한 상황이라 전체 분량이 한눈에 보이는 단일 롱폼 + 섹션 그룹핑이 적합.
- **영상 업로드**: `expo-image-picker`의 `durationLimit`은 앱 내 촬영 경로에만 적용되고 갤러리 선택 영상에는 적용되지 않음 → 클라이언트 자체 duration/용량 검증 필수. 업로드 캡 ~20MB 권장.

## 결정 사항

| 항목             | 결정                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| 사례금(`reward`) | **완전 제거**. 필요 시 색·특징 본문에 자유 기술                                         |
| 폼 구조          | **단일 롱폼 + 섹션 그룹핑**. 개인공고(`CommunityAdoptForm`) 골격 준용                   |
| 연락처           | **개인공고와 통일** — `contactPhone` 단일 문자열 → `ContactSelectField` 복수 연락 수단  |
| 선택 항목        | **"아이 정보 (선택)" 아코디언 1개 추가** — 이름/성별/품종/나이/몸무게/인식표·마이크로칩 |
| 미디어           | 사진+영상, 합산 최대 10, 영상 1개·30초·720p 압축 (커뮤니티 패리티)                      |
| 공용 필드        | `features/community/create/ui/field/*` → `shared/ui/form/` 승격                         |

### "아이 정보" 아코디언 채택 근거

- **이름**은 발견자가 불러서 동일 개체를 확인하는 핵심 정보인데 현재 받을 곳이 없다.
- **인식표·마이크로칩 유무**는 발견자가 병원·보호소로 데려갈지 판단하는 기준이 된다.
- 아코디언은 기본 접힘이라 급한 사용자의 이탈 비용이 사실상 0이고, 여유 있는 사용자만 추가 입력한다.
- `CREATE_POST_OPTIONS`와 품종·나이 셀렉트 시트를 그대로 재사용하므로 구현 비용이 낮다.

## 화면 구조

```
ModalPageHeader "실종 신고하기" (fullScreen, X 닫기 → dirty면 CancelModal)
FormLayout (footer: BottomButton "등록하기")
├ SafetyNotice — 실종 신고 안전 고지
├ Caption "*은 필수 표기 정보입니다"
├ Section  사진·동영상 첨부(최대 10장) *      MediaAttachField
├ ────── Divider (8px, $white850)
├ Section  "실종 정보"
│          분류 *            OptionSelectField (개/고양이/기타)
│          색·특징 *         LabelTextArea
│          실종 일시 *       LabelSelectField → 날짜 시트
│          실종 장소 *       LabelSelectField → LocationBottomSheet
├ ────── Divider
├ Accordion "아이 정보 (선택)"
│          이름              LabelTextField
│          성별              OptionSelectField
│          품종              LabelSelectField → 품종 시트
│          나이              LabelSelectField → 나이 시트
│          몸무게            LabelTextField (decimal-pad, 우측 "kg")
│          인식표·마이크로칩  OptionSelectField
├ ────── Divider
└ Section  "연락 정보" *      ContactSelectField
```

색·특징 placeholder는 상황 정보까지 유도한다: `예) 갈색 푸들, 빨간 목줄 착용, 겁이 많아요`

## 컴포넌트 매핑

| 기존                                               | 변경 후                                                         |
| -------------------------------------------------- | --------------------------------------------------------------- |
| `KeyboardAwareScrollView` + buttonHeight 수동 측정 | `FormLayout`                                                    |
| `LabelImageSelector`                               | `MediaAttachField`                                              |
| `MissingDateField` (전용)                          | `LabelSelectField` + 날짜 시트 (전용 컴포넌트 폐기)             |
| `LocationPickField` (전용)                         | `LabelSelectField` + `LocationBottomSheet` (전용 컴포넌트 폐기) |
| `LabelTextField` (colorFeature)                    | `LabelTextArea`                                                 |
| `LabelTextField` (contactPhone)                    | `ContactSelectField`                                            |
| `LabelTextField` (reward)                          | 삭제                                                            |

## FSD 정리

`features/missing` → `features/community` cross-slice import를 해소한다.

**`shared/ui/form/`로 승격**
`FieldLabel` `FieldError` `LabelTextField` `LabelTextArea` `LabelSelectField` `LabelChipGroup` `OptionSelectField` `ContactSelectField` `MediaAttachField`

**`features/upload/`로 이동**
`use-media-picker` (기존 `use-image-upload`·`use-video-upload` 옆)

커뮤니티 측은 import 경로만 교체한다.

## 에러 처리

- `FIELD_ORDER` 기반 첫 에러 탐색 유지 + **해당 필드로 scroll + focus 추가** (커뮤니티 패턴 준용)
- 이미지/영상 업로드 실패와 등록 API 실패를 **구분된 메시지**로 분리 (현재 동일 mutation에서 뭉뚱그려짐)
- `lat`/`lng` zod 에러 메시지 부재 → 한글 메시지 부여
- `regionCode` 비동기 주입 레이스 해소 (장소 선택 직후 즉시 제출 시 null 전송)

## 백엔드 영향 (상세는 /spec)

- `reward` 컬럼 제거 또는 deprecated 처리
- `contactPhone: string` → 연락 수단 배열 + 기존 데이터 마이그레이션(전화번호 → 배열 1건)
- `videoUrl` / `videoThumbnailUrl` 컬럼 추가
- 선택 필드 컬럼 추가(전부 nullable): `name` `gender` `specificType` `age` `weight` `hasIdTag`

## 연관 기능 영향

- **포스터(#05)** — `contactPhone` 단일값을 렌더링하므로 배열 대응 필요. 전화 우선, 없으면 첫 번째 수단.
- **실종 상세** — 사례금 표시 행 제거, 영상 재생(`VideoViewer`) 추가, 선택 필드 표시 섹션 추가.
- **통합 피드** — 카드 썸네일이 영상일 때 처리 확인.

## 검증

`tsc` + `jest` + `eslint`. 회귀 범위: missing 스키마·`to-create-body`·카드 테스트 갱신, 승격된 필드 컴포넌트 테스트 이관, 커뮤니티 폼 회귀(import 경로 변경), 포스터 렌더링.
