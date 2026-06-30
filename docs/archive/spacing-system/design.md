# Spacing System — 간격·배치 일관성 표준

횡단 UI 세팅. 특정 기능이 아니라 앱 전체 화면의 간격·배치를 단일 표준으로 수렴한다.
입력: 현황 전수조사(Explore) + 모바일 spacing BP(WebSearch). Figma 없음 → Case B.

## 배경 — 현황 진단

- **외곽 좌우 패딩**: `20`(14회) 주류, `shelter` 권한없음 화면만 `32` 예외. 100% raw 숫자, `space` 토큰 미사용
- **섹션 세로 간격**: `SECTION_GAP=36`(홈) · `16` · `28` · `32` 난립
- **리스트 아이템 간격**: `32`로 비교적 통일
- **카드 내부 패딩**: `ShelterCard` `px=16`, 나머지 `px 16~20`, 카드 gap `4~20` 산발
- **근본 원인(정정)**: `SafeScreen`은 사실상 미사용 컴포넌트(`+not-found`만 사용). 화면마다 `styled(View)` 컨테이너를 각자 정의해 `px`를 직접 박는 구조 → 단일 래퍼 중앙화가 성립하지 않음. 따라서 **공용 상수 수렴**으로 통일

## BP 근거

- 4pt 그리드 토큰 이미 보유(`$1`=4 … `$9`=36) → 토대 정상, raw 난립이 문제
- 화면 외곽 패딩 **단일값 통일**이 핵심 (모바일 표준 16~20)
- **internal ≤ external** 위계: 카드 내부 패딩 ≤ 카드/섹션 간격 ≤ 화면 외곽 여백
- 코어 스케일 5~8개로 제한
- semantic 토큰(screen-edge/section-gap/card-padding) 권장

출처: [8pt Grid](https://www.rejuvenate.digital/news/designing-rhythm-power-8pt-grid-ui-design), [Spacing best practices](https://cieden.com/book/sub-atomic/spacing/spacing-best-practices), [Material Spacing](https://m2.material.io/design/layout/spacing-methods.html), [Mobile System Design](https://www.mobilesystemdesign.com/blog/design-system-spacing/)

## 표준 (`shared/lib/spacing.ts`)

| 역할                | 상수            | 토큰 | px  | 적용                      |
| ------------------- | --------------- | ---- | --- | ------------------------- |
| 화면/섹션 외곽 좌우 | `SCREEN_GUTTER` | `$5` | 20  | 전 화면·피드·헤더 단일값  |
| 섹션 간 간격        | `SECTION_GAP`   | `$8` | 32  | 홈 섹션 사이 (기존 36→32) |
| 섹션 내 블록 간     | `BLOCK_GAP`     | `$4` | 16  | 한 섹션 안 요소           |
| 리스트 아이템 간    | `LIST_ITEM_GAP` | `$8` | 32  | 기존 32 유지              |
| 카드 박스 내부 패딩 | `CARD_PADDING`  | `$4` | 16  | 외곽 20 ≥ 카드 16 (위계)  |

위계: 외곽 20 ≥ 분리용 간격 32 · 밀집용 패딩 16.

## 컴포넌트 매핑 (실제 적용)

| 컴포넌트                  | 출처               | 변경/신규 | 내용                                                               |
| ------------------------- | ------------------ | --------- | ------------------------------------------------------------------ |
| `spacing.ts`              | `shared/lib`       | **신규**  | 의미 상수 5종 집약. tamagui 숫자 토큰은 그대로, 타입 스키마 미변경 |
| 화면 라우트 7개           | `app/**`           | 변경      | 직접 `px={20}`/`px={32}` → `SCREEN_GUTTER` (shelter 32→20 통일)    |
| 섹션·피드·헤더 위젯 10개  | `widgets/**`       | 변경      | 섹션 좌우 `px={20}` → `SCREEN_GUTTER`                              |
| `ShelterCard` 등 카드 3개 | `entities/**`      | 변경      | 카드 박스 내부 `px={16}` → `CARD_PADDING`, 스켈레톤 정렬 동일      |
| `HeaderLayout`            | `shared/ui/layout` | 변경      | `px: 20` → `SCREEN_GUTTER`                                         |

### FSD 슬라이스 매핑

- `shared/lib/spacing.ts` — 도메인 무관 상수 (신규). 기존 `shared/lib` 구조 활용, 디렉터리 신설 없음

## 적용 결과

- 외곽 좌우 패딩: 전 화면·위젯 `SCREEN_GUTTER`(20) 단일 수렴, `shelter` 32 예외 제거
- 카드 박스 내부 패딩: `CARD_PADDING`(16) 토큰화 (값 유지 → 시각 회귀 0)
- 홈 섹션 간격 36 → `SECTION_GAP`(32)
- 검증: tsc 0 · eslint 0 errors · jest 521 pass

## 보류 / 별도 이슈

- **세로 간격(mb/gap/py) 전면 토큰화 보류**: 대부분 이미 4의 배수 표준값(16/32)이라 시각 문제 없음. ROI 대비 범위 과대 → 점진 수렴
- **`shelter-bottom-sheet` 컨텐츠 `px={20}` (별도 이슈)**: 바텀시트 provider가 좌우 패딩을 이미 강제 적용하는데 컨텐츠에 `px={20}`을 또 줘 이중 패딩 가능성. 토큰화가 아니라 **제거** 검토 대상 → 이번 범위 제외

## ADR

- **상수 수렴 (단일 래퍼 X)**: `SafeScreen`이 미사용이라 중앙 래퍼 강제 도입은 전 화면 구조 리팩터 + 회귀 위험. 화면 구조가 제각각이므로 `SCREEN_GUTTER` 상수 수렴이 같은 효과(값 한 곳 관리)를 더 안전하게 달성
- **외곽 20 유지(16 아님)**: 현 주류 20(14회). 변경 최소 + BP 범위 내
- **상수 파일(tamagui 토큰 추가 X)**: 숫자 토큰에 semantic 의미를 얹되 tamagui 스키마·타입 미변경. 기존 상수 패턴과 일관
