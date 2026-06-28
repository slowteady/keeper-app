# 개인 입양 공고 필터링 — 기술 명세

> 입력: 개인 공고(PostAdoptionPersonal) 구조화 필드 정합 조사 + 보호소 필터(`shelter-adopt-filter.md`) UI/백엔드 패턴.
> 범위: **개인 공고(커뮤니티 ADOPTION_PERSONAL) 목록만**. 보호소 공고는 `shelter-adopt-filter.md`.
> 상태: 확정. 구현 대기.

## 1. Problem / Goals

- 개인 공고 목록 상단의 **자유 텍스트 검색 인풋**을 보호소와 동일한 **구조화 필터**로 전환.
- 개인 공고는 핵심 입력이 대부분 고정 옵션 선택(`OptionSelectField`)이라 정합이 충분. 보호소와 UI·UX를 **거의 동일**하게 맞춘다(차원별 칩→각자 바텀시트, 즉시 적용, 정렬 드롭다운). 차이: 정렬 옵션은 보호소(마감임박/신규=공공 전용)와 달라 최신순/오래된순(§8 ADR).
- Non-Goals: 보호소 공고 필터(별도), 성격·생활 enum 필터(희소·과부하 — ADR), 몸무게 버킷(우선순위 낮음), 지역 시군구 계단식(시도 단독).

## 2. UI 모델 (보호소 B안과 평행 — 차원별 칩 → 각자 바텀시트)

검색 인풋 제거. 축종 칩(상시) 아래 **필터 칩 바**(가로 스크롤) + 정렬 **드롭다운**(우측). 각 칩을 누르면 그 차원의 바텀시트가 뜨고 **즉시 적용**. 활성값은 칩 라벨 + 아웃라인 강조. 활성 필터 ≥1이면 `초기화` 칩 노출. 보호소 컴포넌트(`SearchableSelectSheet`, `useBottomSheetMenu`, `FilterChip`, `Dropdown`) 그대로 재사용.

| 차원       | 컬럼               | 값/옵션                         | 선택 | 시트/컨트롤                                    |
| ---------- | ------------------ | ------------------------------- | ---- | ---------------------------------------------- |
| 축종       | `animalType`       | 전체/강아지/고양이/기타         | 단일 | 상시 칩(기존, 시트 밖)                         |
| 지역(시도) | `location`         | 17개 시도                       | 단일 | 검색 없는 리스트 시트(`SearchableSelectSheet`) |
| 품종       | `specificType`     | 축종별 DOG/CAT 표준 품종명      | 단일 | 검색 리스트 시트(축종 종속, OTHER 시 **숨김**) |
| 성별       | `gender`           | 전체/남아(M)/여아(F)/모름(NONE) | 단일 | `useBottomSheetMenu`                           |
| 중성화     | `neuterYn`         | 전체/완료(Y)/미완료(N)          | 단일 | `useBottomSheetMenu`                           |
| 연령       | `birthYear`(신설)  | 전체/1살미만/1~3살/3~7살/7살↑   | 단일 | `useBottomSheetMenu`                           |
| 입양 유형  | `protectionType`   | 전체/입양 가능/임보 가능        | 단일 | `useBottomSheetMenu`                           |
| 입양 상태  | `adoptionStatus`   | 입양중/완료/전체 (기본 입양중)  | 단일 | `useBottomSheetMenu`                           |
| 예방접종   | `vaccinationCheck` | 전체/접종/미접종                | 단일 | `useBottomSheetMenu`                           |
| 건강검진   | `healthCheck`      | 전체/완료(Y)/미완료(N)          | 단일 | `useBottomSheetMenu`                           |
| 정렬       | `sort`             | 최신순(NEW)/오래된순(OLD)       | 단일 | `Dropdown`(텍스트형, 우측 분리)                |

정렬은 항상 **입양중 우선**(1차) 뒤의 2차 정렬. 인기/조회/댓글순은 미션 충돌로 제외(§8 ADR).

제외(ADR): 성격·생활 enum 7종(배변/짖음/활동량/분리불안/친화도 — 희소·과부하) / 몸무게(자유 숫자, 우선순위 낮음) / 자유 텍스트(제목·소개글·특이사항).

## 3. Backend Impact (keeper-backend, develop · prod 라인)

### 3-0. 검색 파라미터 제거

`ea3140b`(개인 공고 목록 검색)에서 추가한 `postListQuerySchema.search` + `post.service.findList`의 `ADOPTION_PERSONAL` search where를 **제거**(필터 전환으로 무용). 보호소와 동일하게 검색 인풋 폐지.

### 3-1. 마이그레이션 `add_post_adoption_personal_birth_year`

- `PostAdoptionPersonal.birthYear Int?` + `@@index([animalType, birthYear])`.
- 백필: 기존 행 `age`(`'2022'` 년생 문자열)에서 4자리 연도 추출. 미상 → `NULL`.
- 작성/수정 시 `age`→`birthYear` 파싱(보호소 `parseBirthYear`와 동일 정규식 `/\d{4}/`). `age` 컬럼은 표시용으로 유지, `birthYear`는 연령 필터·정렬 전용.

### 3-2. DTO (`post.dto.ts` — `postListQuerySchema`)

추가 파라미터(전부 optional): `region`(시도 key) · `breed`(품종명) · `gender`(M/F/NONE) · `neuter`(Y/N) · `ageBuckets`(`UNDER_1/AGE_1_3/AGE_3_7/OVER_7` 배열, 콤마 preprocess) · `protectionType`(`ADOPTION`/`TEMPORARY` — 입양만 BOTH 포용) · `adoptionStatus`(`IN_PROGRESS`/`COMPLETED`) · `vaccination`(`VACCINATED`/`NOT`) · `healthCheck`(Y/N). `search` 제거.

> 연령 계약은 보호소와 동일하게 배열 유지(프론트는 단일선택 `[age]`).

### 3-3. `post.service.findList` — 개인 공고 where 확장

`category === 'ADOPTION_PERSONAL'`일 때 `where.adoptionPersonal`에 누적:

- 지역: `location = { contains: 시도 keyword }` (보호소 `sido.constant` 재사용)
- 품종: `specificType = breed` / 성별: `gender = gender` / 건강검진: `healthCheck = healthCheck`
- 중성화: `neuterYn = neuter` (Y/N만)
- 예방접종: `VACCINATED` → `vaccinationCheck in [FIRST, SECOND, THIRD]` / `NOT` → `= 'NOT'`
- 입양 유형(**비대칭**): `ADOPTION` → `protectionType in [ADOPTION, BOTH]`(입양은 BOTH 포용) / `TEMPORARY` → `= TEMPORARY`(임보는 BOTH 제외)
- 입양 상태: `adoptionStatus = adoptionStatus` (기본 `IN_PROGRESS`)
- 연령: `ageBuckets` → 현재연도 기준 `birthYear` 범위 OR(보호소 `birthYearRange` 재사용, 반열림). `birthYear NULL`은 연령 필터 시 제외.

정렬: `sort` enum에 `OLD` 추가(`buildListOrderBy`: `createdAt asc`). 기존 `adoptionStatus` 우선 정렬(입양중 먼저)이 1차이고 `sort`는 그 뒤 2차. 카드 필드 노출은 불변.

### 3-4. 시도 상수

보호소 `sido.constant.ts`(17개 `{ key, label, keyword }`) 그대로 재사용. `location`(address_name, 예 `"서울특별시 강남구 …"`)에 시도 keyword(`서울`·`전라북`)가 포함되어 `contains` 매칭.

### 3-5. 카운트

별도 카운트 없음(보호소와 동일 즉시 적용 모델).

## 4. 프론트 (keeper-app)

- **상태** `usePersonalFilter`(`useShelterFilter` 평행): `{ region, breed, gender, neuter, age, protectionType, adoptionStatus, vaccination, healthCheck }` + per-dim setter(즉시 적용) + `reset` + `labels` + `activeCount`. 초기값 `adoptionStatus: 'IN_PROGRESS'`(기본 입양중만 — 단 초기화/activeCount 계산에서 기본값은 비활성으로 취급).
- **칩 바** `PersonalFilterBar`(`ShelterFilterBar` 평행): 차원별 `FilterChip` + 정렬 `Dropdown`. 지역·품종=`SearchableSelectSheet`, 나머지=`useBottomSheetMenu`. 축종 종속(품종 칩은 강아지/고양이 시만, 축종 변경 시 breed 해제).
- **파라미터** `PostListQuery`/개인 목록 훅: 위 9개 + `ageBuckets`(`age`→`[age]`) 전달, `search` 제거.
- **스크롤**: 필터 변경 시 리스트 상단 리셋(`scrollToOffset 0`).
- 개인 공고 카드·그리드 불가침. 보호소 탭 무영향.

## 5. 스키마 3중 검증

| 필드           | DB(PostAdoptionPersonal)       | 백엔드 DTO                      | 프론트                | 정합                                |
| -------------- | ------------------------------ | ------------------------------- | --------------------- | ----------------------------------- |
| region         | `location` String              | `region` string→keyword         | `region` string       | 매핑(키→keyword contains)           |
| breed          | `specificType` String          | `breed` string                  | `breed` string        | equals(품종명)                      |
| gender         | `gender` String(M/F/NONE)      | `gender` enum                   | `gender`              | 일치(개인 enum, 보호소 Q와 별개)    |
| neuter         | `neuterYn` enum(Y/N/U/NONE)    | `neuter` enum(Y/N)              | `neuter`              | 부분(U/NONE은 필터 미노출)          |
| age            | `birthYear` Int?(신설)         | `ageBuckets` enum[]             | `age?` 단일 → `[age]` | 버킷→birthYear 범위 백엔드 계산     |
| protectionType | `protectionType` enum          | `protectionType`(ADOPTION/TEMP) | `protectionType`      | 비대칭(입양=in[X,BOTH]/임보=equals) |
| adoptionStatus | `adoptionStatus` enum          | `adoptionStatus`                | `adoptionStatus`      | equals(기본 IN_PROGRESS)            |
| vaccination    | `vaccinationCheck` enum        | `vaccination`(VACCINATED/NOT)   | `vaccination`         | 매핑(접종=1·2·3차 in)               |
| healthCheck    | `healthCheck` enum(Y/N/U/NONE) | `healthCheck` enum(Y/N)         | `healthCheck`         | 부분(U/NONE은 필터 미노출)          |

## 6. UI 배치

```
[전체][강아지][고양이][기타]                                              ← 축종 (상시 칩)
← [초기화][서울▾][연령▾][성별▾][중성화▾][입양유형▾][입양상태▾][접종▾][건강검진▾][품종▾] →  [최신순▾]
   (필터 칩 가로 스크롤; 초기화는 활성 시만)                                          (정렬, 우측 분리)
──────── (개인 공고 카드 그대로) ────────

칩 탭 → 각 차원 바텀시트:
 · 지역/품종 = SearchableSelectSheet (전체 + 라디오 리스트, 품종만 검색)
 · 그 외 = useBottomSheetMenu (전체 + 옵션)
 · 시트 좌우 패딩은 provider(px24)가 제공 — 컨텐츠는 세로 패딩만
```

- active 칩 = 투명 배경 + 검정 테두리·굵은 글자(색 fill 아님 — 보호소와 동일)
- 입양 상태 칩은 기본 `입양중`을 표시하되, 기본값이면 비활성 스타일(초기화 카운트 제외)

## 7. 테스트 시나리오

**P0** (백엔드 `post.service` spec — 개인 목록 where)

- region=SEOUL → `location contains 서울`
- breed/gender/healthCheck → equals
- neuter=Y → `neuterYn = Y`
- vaccination=VACCINATED → `vaccinationCheck in [FIRST,SECOND,THIRD]`
- protectionType=ADOPTION → `protectionType in [ADOPTION, BOTH]`(포용) / TEMPORARY → `= TEMPORARY`(BOTH 제외)
- adoptionStatus 미지정 시 기본 `IN_PROGRESS`
- ageBuckets=[UNDER_1, OVER_7] → birthYear 범위 OR
- 다중 조합 → where AND
- 검색 제거 후 회귀 없음(축종·정렬·입양중 우선 정렬 정상)

**엣지**

- `birthYear NULL`(나이 미입력): 연령 필터 시 제외 / 비활성 시 노출
- `location` 시도명 미포함(자유 입력 변형): keyword 매칭 실패 → 결과 0(허용, 데이터 품질 의존)
- 품종 시트: OTHER 축종 시 칩 숨김
- 작성/수정 시 `age`→`birthYear` 동기화

## 8. ADR

- **보호소 UI/컴포넌트 전면 재사용**: `SearchableSelectSheet`·`useBottomSheetMenu`·`FilterChip`·`sido.constant`·`birthYearRange`·버킷 enum 그대로. 신규 코드 최소화·UX 일관.
- **검색 인풋 제거(ea3140b revert)**: 보호소와 완전 일치. 구조화 필터로 탐색 충분 판단(사용자 결정). 제목·소개글 전문검색은 후순위 백로그.
- **입양 유형 비대칭 매칭**: `입양 가능`은 `BOTH` 포함(in[ADOPTION,BOTH]) — 입양 의사에 둘 다 가능 공고 노출. `임보 가능`은 `TEMPORARY`만(BOTH 제외) — 임보 전용 공고만 보고 싶다는 의도(사용자 결정).
- **입양 상태 기본 `입양중만`**: 완료 공고 노이즈 감소. 카드 dim·입양중 우선 정렬과 일관. 완료는 칩으로 켤 때만(사용자 결정).
- **중성화·건강검진·예방접종 단순화**: 완료/미완료, 접종/미접종 2단계. 미상·정보없음·차수는 필터 가치 낮아 옵션에서 제외(시트 과부하 회피, 사용자 결정).
- **성별 NONE=모름**: 개인 enum(M/F/NONE)은 보호소 Q와 별개. 카드 라벨 정합 유지.
- **`birthYear` 컬럼 신설**: `age` 문자열 SQL 계산 불안정 → 보호소와 동일 패턴(숫자 파싱·인덱스). 작성 시 동기화.
- **지역 시도 단독**: `location`(address_name) 시도 keyword contains. 시군구는 자유 입력 변형 많아 후순위.
- **품종 DOG/CAT만**: 표준 품종명 선택값(`DOG_BREEDS`/`CAT_BREEDS`). OTHER는 자유 입력이라 품종 필터 비적용(칩 숨김).
- **성격·생활 enum 필터 제외**: 작성 시 선택 항목이라 희소, 7종 칩 노출은 과부하. 상세 화면 표시 전용 유지.
- **정렬 = 최신순/오래된순만**: 보호소 정렬축(마감임박/신규)은 공공 abandonment 공고일 전용이라 개인에 부적합. 개인은 `sort` enum의 `NEW`/`OLD`만 노출. `OLD`(오래된순)는 입양 못 가고 오래 기다린 동물을 위로 올려 keeper의 매칭 미션에 정합. 인기/조회/댓글순은 백엔드 지원되나 관심 편중(rich-get-richer)으로 미션 충돌 → 제외(사용자 결정).

## 9. 상태

확정. `/be`(검색 제거 + birthYear 마이그레이션 + where 확장) → `/fe`(usePersonalFilter + PersonalFilterBar + 검색 인풋 제거) 순. 보호소와 평행 구현이라 위험 낮음.
