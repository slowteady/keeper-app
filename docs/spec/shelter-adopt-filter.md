# 보호소 공고 필터링 — 기술 명세

> 입력: 필터 옵션·배치 BP 딥조사(국내 입양 서비스 필터 구성 / 다중 필터 UI) + abandonment 데이터 정합 검증.
> 범위: **보호소(공공 abandonment) 공고 목록만**. 개인 공고는 별도.
> 상태: 구현 완료(B 안). 백엔드·프론트 반영, 수동 QA 통과.

## 1. Problem / Goals

- 보호소 목록 상단의 **자유 텍스트 검색 인풋**(품종·지역 contains)을 **구조화 필터**로 전환.
- 공공 공고는 모든 차원이 구조화돼 있어 자유 텍스트로 검색할 유의미한 축이 없음 → 검색 인풋 **완전 제거**.
- Non-Goals: 개인 공고 필터(별도), 시도→시군구 계단식(시도 단독), 색상·체중·접종·건강검진 필터(데이터 정합 미달 — ADR).

## 2. UI 모델 (B 안 — 차원별 칩 → 각자 바텀시트)

검색 인풋 제거. 축종 칩(상시) 아래 **필터 칩 바**(가로 스크롤) + 정렬 **드롭다운**(우측, 칩과 구분). 각 칩을 누르면 그 차원의 바텀시트가 뜨고 **즉시 적용**(정렬 `최신순` 칩과 동일 UX). 활성값은 칩 라벨에 표시(예 `서울 ▾`) + 아웃라인 강조. 활성 필터 ≥1이면 `초기화` 칩 노출.

| 차원       | 컬럼                  | 값                             | 선택 | 시트/컨트롤                                          |
| ---------- | --------------------- | ------------------------------ | ---- | ---------------------------------------------------- |
| 축종       | `upKindCd`            | 전체/강아지/고양이/기타        | 단일 | 상시 칩(기존, 시트 밖)                               |
| 지역(시도) | `orgNm`               | 17개 시도                      | 단일 | 검색 없는 리스트 시트(`SearchableSelectSheet`, 17개) |
| 품종       | `kindCd`(+`kindNm`)   | 축종별 DOG/CAT_BREEDS          | 단일 | 검색 리스트 시트(축종 종속, 미선택 시 칩 **숨김**)   |
| 성별       | `sexCd`               | 전체/남아(M)/여아(F)/모름(Q)   | 단일 | `useBottomSheetMenu` (정렬 칩과 동일)                |
| 중성화     | `neuterYn`            | 전체/완료(Y)/미완료(N)/모름(U) | 단일 | `useBottomSheetMenu`                                 |
| 연령       | `birthYear`           | 전체/1살미만/1~3살/3~7살/7살↑  | 단일 | `useBottomSheetMenu`                                 |
| 정렬       | 공고일/`processState` | 전체/신규/마감임박             | 단일 | `Dropdown`(텍스트형, 우측 분리)                      |

제외(정합 미달, ADR): 색상(`colorCd` 자유텍스트) / 체중(`weight` 비정형) / 접종·건강검진(공공 sparse).

## 3. Backend Impact (keeper-backend, develop · prod 라인)

### 3-1. 마이그레이션 `20260615111802_add_abandonment_birth_year`

- `Abandonment.birthYear Int?` + `@@index([upKindCd, birthYear])`.
- 백필: 기존 행 `age`(`'2022(년생)'`)에서 4자리 연도 추출(`substring ~ '\d{4}'`). 미상 → `NULL`.
- 동기화: `abandonment-sync.converter`에 `age`→`birthYear` 파싱(`parseBirthYear`) 추가.

### 3-2. DTO (`abandonment.dto.ts` — `abandonmentListQuerySchema`)

추가 파라미터(전부 optional): `region`(시도 key) · `breed`(`kindCd`) · `gender`(M/F/Q) · `neuter`(Y/N/U) · `ageBuckets`(`UNDER_1/AGE_1_3/AGE_3_7/OVER_7` 배열, 콤마/반복 둘 다 허용 preprocess). `search` **제거**.

> 프론트는 연령을 단일선택하지만 백엔드 계약은 배열 유지(`[age]` 1개 전달). 추후 다중 확장 무변경 대응.

### 3-3. `abandonment.service.buildWhere`

- 지역: `orgNm = { contains: 시도 keyword }` (시도 상수에서 도출)
- 품종: `kindCd = breed` / 성별: `sexCd = gender` / 중성화: `neuterYn = neuter`
- 연령: `ageBuckets` → 현재연도 기준 `birthYear` 범위 OR. 나이 = `현재연도 - birthYear`, 반열림: `UNDER_1` <1 / `AGE_1_3` 1~2 / `AGE_3_7` 3~6 / `OVER_7` ≥7. `birthYear NULL`은 연령 필터 시 제외.

### 3-4. 시도 정규화 상수 `sido.constant.ts`

17개 `{ key, label, keyword }`. `keyword`는 `orgNm contains`용(예 `강원`, `전라북` — 명칭 변경/혼재 내성).

### 3-5. 카운트

별도 카운트 없음(B는 즉시 적용 모델 — 조합 카운트 미리보기 미채택).

## 4. 프론트 (keeper-app)

- **상태** `useShelterFilter`: `{ region, breed, gender, neuter, age }` + per-dim setter(즉시 적용, draft 없음) + `reset` + `labels`(칩 표시용) + `activeCount`(초기화 노출 판단).
- **칩 바** `ShelterFilterBar`: 차원별 `FilterChip`(아웃라인 active) + 정렬 `Dropdown`. 성별·중성화·연령=`useBottomSheetMenu`, 지역·품종=`present(<SearchableSelectSheet/>)`. 축종 종속(품종 칩은 강아지/고양이 선택 시만 렌더, 축종 변경 시 breed 해제).
- **파라미터** `AdoptParamsSchema`/`useAdoptList`: region/breed/gender/neuter/ageBuckets 추가(`age`→`[age]`), `search` 제거. `getAdopts`가 `ageBuckets` 콤마 직렬화.
- **스크롤**: 필터 변경 시 리스트 상단 리셋(`scrollToOffset 0`).
- 보호소 카드·2열 그리드 불가침. 개인 탭은 검색 유지(무영향).

## 5. 스키마 3중 검증

| 필드   | DB(Abandonment)          | 백엔드 DTO              | 프론트                | 정합                              |
| ------ | ------------------------ | ----------------------- | --------------------- | --------------------------------- |
| region | `orgNm` String           | `region` string→keyword | `region` string       | 매핑(키→keyword)                  |
| breed  | `kindCd` String          | `breed` string          | `breed` string        | 일치                              |
| gender | `sexCd` String(M/F/Q)    | `gender` enum M/F/Q     | `gender` M/F/Q        | 일치                              |
| neuter | `neuterYn` String(Y/N/U) | `neuter` enum Y/N/U     | `neuter` Y/N/U        | 일치(보호소 쿼리 전용 enum)       |
| age    | `birthYear` Int?         | `ageBuckets` enum[]     | `age?` 단일 → `[age]` | 버킷→birthYear 범위는 백엔드 계산 |

## 6. UI 배치

```
[전체][강아지][고양이][기타]                         ← 축종 (상시 칩)
← [초기화][서울▾][연령▾][성별▾][중성화▾][품종▾] →  [최신순▾]
   (필터 칩 가로 스크롤; 초기화는 활성 시만)         (정렬 드롭다운, 우측 분리)
──────── (보호소 카드 2열 그리드 그대로) ────────

칩 탭 → 각 차원 바텀시트:
 · 지역/품종 = SearchableSelectSheet (전체 + 라디오 리스트, 품종만 검색)
 · 성별/중성화/연령 = useBottomSheetMenu (전체 + 옵션, 정렬 칩과 동일)
 · 시트 좌우 패딩은 provider(px24)가 제공 — 컨텐츠는 세로 패딩만
```

- active 칩 = 투명 배경 + 검정 테두리·굵은 글자(**색 fill 아님**)
- 정렬은 필터와 의미가 달라 칩이 아닌 **드롭다운(텍스트형)** 으로 구분

## 7. 테스트 시나리오

**P0** (백엔드 `abandonment.service.spec`)

- region=SEOUL → `orgNm contains 서울`
- breed/gender/neuter → 컬럼 equals
- ageBuckets=[UNDER_1, OVER_7] → birthYear 범위 OR (반열림)
- 다중 조합 → where AND
- 검색 제거 후 회귀 없음(축종·정렬 정상)

**엣지**

- `birthYear NULL`: 연령 필터 시 제외 / 비활성 시 노출
- `orgNm` 명칭 변형(`전라북도`↔`전북특별자치도`) keyword 매칭
- 품종 100+ 시트 내 검색
- 동기화 신규 행 `birthYear` 채워짐

## 8. ADR

- **A(통합 시트+조합 카운트) → B(차원별 칩→각자 시트) 채택**: 정렬 `최신순` 칩(`ChipButton`+`useBottomSheetMenu`)과 **동일 UX 언어**·직접성(원하는 차원 1탭). 통합 시트는 코드량↑·일관성↓. 대가로 조합 카운트("N마리 보기") 포기 — 사용자 합의(불필요).
- **성별·중성화·연령 = `useBottomSheetMenu`**: 짧은 단일선택 → 정렬 칩 패턴 재사용(신규 코드 0). 지역·품종(17/100+, 검색·리스트)만 커스텀 `SearchableSelectSheet`.
- **연령 단일선택**: 탭→즉시 닫힘으로 타 필터와 일관(다중은 시트가 안 닫혀 이질적). 백엔드 계약은 배열 유지.
- **성별 라벨 남아/여아/모름**: 카드 `convertGenderLabel` 표기와 정합(수컷/암컷 아님).
- **품종 축종 미선택 시 칩 숨김**(비활성 회색 X): 기본값 전체에서 죽은 회색 칩 노출 회피. 강아지/고양이 선택 시 등장.
- **active 칩 = 아웃라인 강조(색 fill X)**: 포커싱은 테두리·굵기 대비로. 녹색 fill은 과함(사용자 피드백).
- **검색 인풋 완전 제거**: 공공 공고 차원이 전부 구조화. 품종 장문만 시트 내 검색.
- **지역 시도 단독(17개)**: `orgNm` 시도+시군구 혼재 → 시도 keyword 매칭이 정합·최소 구현. 계단식은 후순위.
- **`birthYear` 컬럼 신설**: `age` 문자열 SQL 계산 불안정 → 동기화 시 숫자 파싱·인덱스.
- **색상/체중/접종/건강검진 제외**: 자유텍스트·비정형·sparse → 정합성 우선 제외.
- **`neuter` 쿼리 enum 보호소 전용**: 개인 `NeuterYnSchema`(Y/N/U/NONE)와 별개(NONE 불필요).

## 9. 상태

Open Issues 전부 확정·구현 완료. 잔여 확인 1건: 필터 칩 가로 스크롤 ↔ 탭 좌우 스와이프 제스처 충돌 여부(실기기 확인 — 충돌 시 wrap 등 조정).
