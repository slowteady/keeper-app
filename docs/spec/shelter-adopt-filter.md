# 보호소 공고 필터링 — 기술 명세

> 입력: 필터 옵션·배치 BP 딥조사 2건(국내 입양 서비스 필터 구성 / 다중 필터 바텀시트 UI) + abandonment 데이터 정합 검증.
> 범위: **보호소(공공 abandonment) 공고 목록만**. 개인 공고는 별도(보류).
> 상태: 확정 초안 — Open Issues 2건 사용자 확정 대기.

## 1. Problem / Goals

- 보호소 목록 상단의 **자유 텍스트 검색 인풋**(품종·지역 contains)을 **구조화 필터**로 전환.
- 공공 공고는 모든 차원이 구조화돼 있어 자유 텍스트로 검색할 유의미한 축이 없음 → 검색 인풋 **완전 제거**.
- Non-Goals: 개인 공고 필터(별도), 시도→시군구 계단식(이번 제외, 시도 단독), 색상·체중·접종·건강검진 필터(데이터 정합 미달 — ADR 참조).

## 2. 필터 구성 (Data Model 정합)

기존 유지: **축종 칩(`upKindCd`, 상시)** + **정렬(`processState`/공고일, 전체/신규/마감임박, 드롭다운 우측)**.
검색 인풋 제거 → `[필터 N]` 버튼 + 적용 칩 행. 시트 내 5그룹:

| 그룹       | 컬럼                | 값(정합)                      | 선택     | 컨트롤(BP)                                      |
| ---------- | ------------------- | ----------------------------- | -------- | ----------------------------------------------- |
| 지역(시도) | `orgNm`             | 17개 시도(keyword 매칭)       | 단일     | 검색창+라디오 리스트, 아코디언 기본 열림        |
| 품종       | `kindCd`(+`kindNm`) | 축종별 DOG/CAT_BREEDS         | 단일     | 검색창+리스트, 아코디언 기본 닫힘·**축종 종속** |
| 성별       | `sexCd`             | M수컷/F암컷/Q미상             | 단일     | 세그먼트                                        |
| 중성화     | `neuterYn`          | Y완료/N미완료/U미상           | 단일     | 세그먼트                                        |
| 연령       | `birthYear`(신규)   | 1살 미만·1~3살·3~7살·7살 이상 | **다중** | 버킷 칩(숫자 범위)                              |

제외(정합 미달, ADR): 색상(`colorCd` 자유텍스트 고cardinality) / 체중(`weight` 비정형 range) / 접종·건강검진(`vaccinationChk`/`healthChk` 공공 sparse).

## 3. Backend Impact (keeper-backend, develop · prod 라인)

### 3-1. 마이그레이션 (다음 번호 = `20260615015724` 이후)

`add_abandonment_birth_year`:

- `Abandonment.birthYear Int?` 컬럼 추가 + `@@index([upKindCd, birthYear])`(연령+축종 조회).
- 백필: 기존 행 `age`(`'2022(년생)'`)에서 4자리 연도 파싱해 채움. 파싱 실패/미상 → `NULL`.
- 동기화 반영: `abandonment-sync.converter`에서 `age`→`birthYear` 파싱 추가(신규/갱신 동기화 시 채움).

### 3-2. DTO (`abandonment.dto.ts` — `abandonmentListQuerySchema`)

추가 파라미터(전부 optional):

- `region: z.string()` — 시도 key(예 `SEOUL`/`GYEONGGI`… 또는 시도명)
- `breed: z.string()` — `kindCd`
- `gender: z.enum(['M','F','Q'])`
- `neuter: z.enum(['Y','N','U'])`
- `ageBuckets: z.array(z.enum(['UNDER_1','AGE_1_3','AGE_3_7','OVER_7']))` (쿼리스트링 다중 — 1살미만/1~3살/3~7살/7살이상)
- `search` **제거**(또는 deprecated 유지 — 프론트 미전송)

### 3-3. `abandonment.service.buildWhere` 조건 추가

- 지역: `where.orgNm = { contains: <시도 keyword> }` (시도 정규화 상수에서 keyword 도출)
- 품종: `where.kindCd = breed`
- 성별: `where.sexCd = gender`
- 중성화: `where.neuterYn = neuter`
- 연령: `ageBuckets` → 현재연도 기준 `birthYear` 범위 OR 묶음. 나이 = `현재연도 - birthYear`, 경계 반열림:
  - `UNDER_1` 나이<1 / `AGE_1_3` 1≤나이<3 / `AGE_3_7` 3≤나이<7 / `OVER_7` 나이≥7
  - `birthYear NULL`(미상)은 연령 필터 활성 시 제외.

### 3-4. 시도 정규화 상수 (백엔드)

17개 시도 `{ key, label, keyword }`. `keyword`는 `orgNm contains`용(예 `강원`, `경기`, `서울`) — `강원특별자치도`↔`강원도` 등 명칭 변경 내성.

### 3-5. 카운트

신규 엔드포인트 불필요 — 기존 목록 응답의 `total` 재사용(필터 적용된 query로 호출, 프론트 debounce).

## 4. 프론트 API 흐름 (keeper-app)

- **상태**: `useShelterFilter`(가칭) — region/breed/gender/neuter/ageBuckets + 적용 필터 수, 적용/초기화/단건해제. 시트 내 임시 상태 → "보기" 시 확정(batch).
- **파라미터**: `AdoptParamsSchema`(`entities/adopt/schema.ts`) 확장 — region/breed/gender/neuter/ageBuckets 추가, `search` 제거.
- **쿼리**: `useAdoptList`에 필터 파라미터 전달. queryKey에 필터값 포함 → 변경 시 자동 refetch.
- **카운트 미리보기**: 시트 내 선택 변경 시 동일 list query를 `size:1`로 debounce(300ms) 호출해 `total`만 사용 → "개 N마리 보기" 버튼 라벨.
- **에러/빈 상태**: 기존 보호소 빈 상태 재사용.

## 5. 스키마 3중 검증

| 필드       | DB(Abandonment)          | 백엔드 DTO              | 프론트 zod(쿼리) | 정합                                                       |
| ---------- | ------------------------ | ----------------------- | ---------------- | ---------------------------------------------------------- |
| region     | `orgNm` String           | `region` string→keyword | `region` string  | 매핑(키→keyword) 일치                                      |
| breed      | `kindCd` String          | `breed` string          | `breed` string   | 일치                                                       |
| gender     | `sexCd` String(M/F/Q)    | `gender` enum M/F/Q     | enum M/F/Q       | 일치                                                       |
| neuter     | `neuterYn` String(Y/N/U) | `neuter` enum Y/N/U     | enum Y/N/U       | 일치(개인 `NeuterYnSchema`와 별개 — 보호소 쿼리 전용 enum) |
| ageBuckets | `birthYear` Int?         | `ageBuckets` enum[]     | enum[]           | 버킷→birthYear 범위는 백엔드 계산                          |

## 6. UI 명세 (배치 — design 상세는 별도, 여기선 골격)

```
[전체][강아지][고양이][기타]            [정렬▾]
[필터 ②]
[서울 ✕][말티즈 ✕]              전체 해제
──────── (보호소 카드 2열 그리드 그대로) ────────

필터 시트(full-height 90~95%)
 ✕  필터                              초기화
 ▼ 지역    🔍검색 / ○ 라디오 17 시도
 ▶ 품종    (축종 선택됨 · 탭→검색+리스트)
 성별      [전체][수컷][암컷][미상]
 중성화    [전체][완료][미완료][미상]
 연령      [아기][어림][성체][노령]  (다중)
 ─────────────────────────────
 [ 개 147마리 보기 ]   ← sticky, total 실시간
```

- 성별·중성화·연령 전체 펼침 / 지역·품종 아코디언(지역 열림, 품종 닫힘·종속)
- 헤더 고정(X·초기화), 푸터 단독 버튼(초기화는 헤더로 — 오탭 방지)
- 세그먼트 컨트롤: 기존 `ButtonGroup` 확장 검토(없으면 신규)

## 7. 테스트 시나리오

**P0**

- 지역=서울 단일 → `orgNm contains 서울`인 공고만, total 정합
- 축종=고양이 + 품종 선택 → 해당 kindCd만 (축종 미선택 시 품종 비활성)
- 성별=암컷 / 중성화=완료 → sexCd=F·neuterYn=Y
- 연령=`1살 미만`+`7살 이상`(다중) → birthYear 두 범위 OR
- 필터 다중 조합 → where AND 결합, 적용 칩 N개·전체 해제 동작
- 검색 인풋 제거 후 회귀 없음(기존 축종 칩·정렬 정상)

**엣지**

- `birthYear NULL`(나이 미상) 공고: 연령 필터 활성 시 제외 / 비활성 시 노출
- `orgNm` 명칭 변형(`강원도`↔`강원특별자치도`) keyword 매칭
- 필터 0건 결과 → 빈 상태 + "0마리 보기" 비활성 처리
- 품종 목록 100+ 시트 내 검색 필터링
- 동기화로 신규 유입된 행 `birthYear` 채워짐

## 8. ADR

- **검색 인풋 완전 제거**: 공공 공고 차원이 전부 구조화 → 자유 텍스트 무의미. 품종 장문 목록은 시트 내 서브검색으로 대체.
- **지역 시도 단독(17개)**: `orgNm`이 시도+시군구 혼재 → 시도 keyword 매칭이 실데이터 정합·구현 최소. 시도→시군구 계단식은 시도별 시군구 매핑 데이터 필요해 후순위.
- **`birthYear` 컬럼 신설**: `age`가 `'2022(년생)'` 문자열이라 SQL 나이 계산 불안정 → 동기화 시 숫자 파싱·인덱스로 연령 필터를 깔끔히. (문자열 substring 캐스팅 회피)
- **색상/체중/접종/건강검진 제외**: 자유텍스트·비정형·sparse로 "깔끔히 분할" 불가 → 정합성 우선 제외.
- **성별/중성화 세그먼트(단일)·연령 버킷 칩(다중)**: 옵션 3개 이하 상호배타=세그먼트, 불연속 버킷=칩(슬라이더 부적합).
- **연령 = 숫자 범위(1살미만/1~3/3~7/7이상)**: 생애주기 라벨(아기·성체 등)은 모호·자의적이고 공공 `age`가 년생만이라 정밀도 ±1년 → 숫자 구간이 의미 명확. 향·수의학 통용 구분과 정합.
- **카운트 = `total` 재사용**: 신규 엔드포인트 불필요, debounce로 부하 완화.
- **`neuter` 쿼리 enum은 보호소 전용**: 개인 `NeuterYnSchema`(Y/N/U/NONE)와 의미는 같으나 쿼리 파라미터는 보호소 도메인에서 별도 정의(NONE 불필요).

## 9. Open Issues (확정 대기)

1. ~~연령 버킷 경계~~ — **확정**: 숫자 범위 4단계 `1살 미만 / 1~3살 / 3~7살 / 7살 이상`.
2. ~~성별·중성화 단일 선택~~ — **확정**: 단일 선택(세그먼트). 복수 수요 없음.

> Open Issues 전부 확정 — 스펙 fixed, 구현 진입.
